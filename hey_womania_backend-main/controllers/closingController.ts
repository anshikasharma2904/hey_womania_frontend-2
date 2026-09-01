import { Request, Response } from "express";
import { User } from "../models/User";
import { SellPointLedger } from "../models/SellPointLedger";
import { IncomeLedger } from "../models/IncomeLedger";
import { Payout } from "../models/Payout";
import { Order } from "../models/Order";
import { WalletTransaction } from "../models/WalletTransaction";
import { SalesMonthClose } from "../models/SalesMonthClose";
import { getClosingMonth, isLastDayInIndia } from "../utils/salesMonth";
import crypto from "crypto";

type AffiliateCommission = {
  sponsorId: string;
  customerId: string;
  customerName: string;
  orderId: string;
  amount: number;
};

function parseMoney(value: unknown): number {
  const parsed = typeof value === "number"
    ? value
    : parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function orderSubtotal(order: any): number {
  return (order.items || []).reduce(
    (sum: number, item: any) => sum + parseMoney(item.price) * (item.qty || 1),
    0
  );
}

function isPaidForCommission(order: any): boolean {
  if (order.paymentStatus === "Paid") return true;
  return /cod|cash on delivery/i.test(String(order.paymentMethod || order.paymentStatus || ""));
}

async function getAffiliateCommissionsForMonth(month: string): Promise<AffiliateCommission[]> {
  const deliveredLedgers = await SellPointLedger.find({
    status: "approved",
    type: "Credit",
    $or: [
      { salesMonth: month },
      { salesMonth: { $exists: false }, createdAt: { $regex: `^${month}` } }
    ]
  }).lean();
  if (deliveredLedgers.length === 0) return [];

  const orderIds = deliveredLedgers.map((ledger: any) => ledger.orderId);
  const orders = await Order.find({ id: { $in: orderIds }, status: "Delivered" }).lean();
  const commissions: AffiliateCommission[] = [];

  for (const order of orders) {
    if (!order.id) continue;
    if (!isPaidForCommission(order)) continue;

    const customer = await User.findOne({
      id: order.userId,
      joinedViaRefType: "customer",
      uplineId: { $exists: true, $ne: "" }
    }).lean();
    if (!customer?.uplineId) continue;

    const sponsor = await User.findOne({ id: customer.uplineId, role: "partner" }).lean();
    if (!sponsor) continue;

    // "First order" means the customer's first order that actually became
    // paid and delivered. Cancelled, failed, returned and refunded orders do
    // not consume the one-time referral benefit.
    const deliveredOrders = await Order.find({ userId: customer.id, status: "Delivered" })
      .sort({ createdAt: 1, id: 1 })
      .lean();
    const firstEligibleOrder = deliveredOrders.find(isPaidForCommission);
    if (!firstEligibleOrder || firstEligibleOrder.id !== order.id) continue;

    const alreadyPosted = await WalletTransaction.exists({
      source: "Affiliate Link",
      type: "CREDIT",
      orderId: order.id
    });
    if (alreadyPosted) continue;

    const amount = Math.floor(orderSubtotal(order) * 0.05);
    if (amount <= 0) continue;
    commissions.push({
      sponsorId: sponsor.id,
      customerId: customer.id,
      customerName: customer.name || customer.firstName || "Customer",
      orderId: order.id,
      amount
    });
  }

  return commissions;
}

async function reverseInvalidAffiliateCommissions(now: string): Promise<void> {
  const credits = await WalletTransaction.find({ source: "Affiliate Link", type: "CREDIT", orderId: { $exists: true } });
  for (const credit of credits) {
    const order = await Order.findOne({ id: credit.orderId }).lean();
    if (order && order.status === "Delivered" && isPaidForCommission(order)) continue;

    const reversed = await WalletTransaction.exists({
      source: "Affiliate Link",
      type: "DEBIT",
      orderId: credit.orderId
    });
    if (reversed) continue;

    await User.findOneAndUpdate(
      { id: credit.userId },
      { $inc: { "partnerProfile.networkWalletBalance": -credit.amount } }
    );
    await WalletTransaction.create({
      id: crypto.randomUUID(),
      userId: credit.userId,
      amount: credit.amount,
      type: "DEBIT",
      source: "Affiliate Link",
      description: `Referral commission reversed because order ${credit.orderId} is no longer eligible`,
      orderId: credit.orderId,
      referralCustomerId: credit.referralCustomerId,
      commissionMonth: now.substring(0, 7),
      createdAt: now,
      updatedAt: now
    });
  }
}

function isTenthInIndia(): boolean {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    day: "2-digit"
  }).format(new Date());
  return day === "10";
}

async function getDownlineIds(userId: string): Promise<string[]> {
  const list: string[] = [];
  const queue = [userId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const users = await User.find({ uplineId: current }, { id: 1 });
    for (const u of users) {
      if (!list.includes(u.id)) {
        list.push(u.id);
        queue.push(u.id);
      }
    }
  }
  return list;
}

export function getPrevMonth(monthStr: string, subtractMonths = 1): string {
  let [year, month] = monthStr.split("-").map(Number);
  month -= subtractMonths;
  while (month <= 0) {
    month += 12;
    year -= 1;
  }
  return `${year}-${month.toString().padStart(2, '0')}`;
}

export async function checkTeamSalesForMonth(partnerId: string, monthStr: string): Promise<{ teamSales: number, selfSales: number }> {
  const teamUsers = await User.find(
    { role: "partner", $or: [{ id: partnerId }, { ancestors: partnerId }] },
    { id: 1 }
  ).lean();
  const teamUserIds = teamUsers.map(u => u.id);

  const result = await SellPointLedger.aggregate([
    {
      $match: {
        status: "approved",
        $or: [
          { salesMonth: monthStr },
          { salesMonth: { $exists: false }, createdAt: { $regex: `^${monthStr}` } }
        ],
        userId: { $in: teamUserIds }
      }
    },
    { $lookup: { from: "orders", localField: "orderId", foreignField: "id", as: "order" } },
    { $unwind: "$order" },
    {
      $match: {
        "order.status": "Delivered",
        $or: [
          { "order.paymentStatus": "Paid" },
          { "order.paymentMethod": { $regex: /cod|cash on delivery/i } },
          { "order.paymentStatus": { $regex: /cod/i } }
        ]
      }
    },
    {
      $group: {
        _id: "$userId",
        totalSales: {
          $sum: {
            $cond: [{ $eq: ["$type", "Credit"] }, "$sellPrice", { $multiply: ["$sellPrice", -1] }]
          }
        }
      }
    }
  ]);

  let teamSales = 0;
  let selfSales = 0;

  for (const r of result) {
    teamSales += r.totalSales;
    if (r._id === partnerId) {
      selfSales = r.totalSales;
    }
  }

  return { teamSales, selfSales };
}

export const getClosingPreview = async (req: Request, res: Response) => {
  try {
    const { month } = req.query; // e.g. "2026-05"
    if (!month) return res.status(400).json({ error: "Month parameter is required (YYYY-MM)" });
    const currentMonthStr = month.toString();

    const monthsToCheck = [currentMonthStr];
    for (let i = 1; i <= 5; i++) {
      monthsToCheck.push(getPrevMonth(currentMonthStr, i));
    }
    
    // Aggregate sales for ALL 6 months directly in DB
    const historicalAgg = await SellPointLedger.aggregate([
      {
        $match: {
          status: "approved",
          $or: [
            { salesMonth: { $in: monthsToCheck } },
            {
              salesMonth: { $exists: false },
              createdAt: { $regex: new RegExp(`^(${monthsToCheck.join("|")})`) }
            }
          ]
        }
      },
      { $lookup: { from: "orders", localField: "orderId", foreignField: "id", as: "order" } },
      { $unwind: "$order" },
      {
        $match: {
          "order.status": "Delivered",
          $or: [
            { "order.paymentStatus": "Paid" },
            { "order.paymentMethod": { $regex: /cod|cash on delivery/i } },
            { "order.paymentStatus": { $regex: /cod/i } }
          ]
        }
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            month: { $ifNull: ["$salesMonth", { $substr: ["$createdAt", 0, 7] }] }
          },
          totalSales: {
            $sum: {
              $cond: [{ $eq: ["$type", "Credit"] }, "$sellPrice", { $multiply: ["$sellPrice", -1] }]
            }
          }
        }
      }
    ]);

    // Build historical sales maps
    const historicalSelfSales = new Map(); // month -> userId -> sales
    const historicalTeamSales = new Map(); // month -> userId -> sales

    for (const m of monthsToCheck) {
      historicalSelfSales.set(m, new Map());
      historicalTeamSales.set(m, new Map());
    }

    let totalCompanySales = 0;
    for (const r of historicalAgg) {
      const monthMap = historicalSelfSales.get(r._id.month);
      if (monthMap) {
        monthMap.set(r._id.userId, r.totalSales);
        if (r._id.month === currentMonthStr) {
          totalCompanySales += r.totalSales;
        }
      }
    }

    // Now compute team sales for all 6 months and Level Income for current month
    const l1SalesMap = new Map();
    const l2SalesMap = new Map();
    const l3SalesMap = new Map();
    const userMap = new Map();
    const partnerIdSet = new Set(
      (await User.find({ role: "partner" }, { id: 1 }).lean()).map((user: any) => user.id)
    );
    
    const usersCursor = User.find({}, { id: 1, name: 1, firstName: 1, lastName: 1, ancestors: 1, partnerProfile: 1, role: 1 }).cursor();
    for await (const u of usersCursor) {
      userMap.set(u.id, u);

      for (const m of monthsToCheck) {
        const selfSales = historicalSelfSales.get(m)?.get(u.id) || 0;
        if (selfSales === 0 || u.role !== "partner") continue;
        
        const mTeamMap = historicalTeamSales.get(m);
        mTeamMap.set(u.id, (mTeamMap.get(u.id) || 0) + selfSales);
        
        for (const anc of (u.ancestors || []).filter((id: string) => partnerIdSet.has(id))) {
          mTeamMap.set(anc, (mTeamMap.get(anc) || 0) + selfSales);
        }
      }

      // Compute L1/L2/L3 bases for current month
      const currentSelfSales = historicalSelfSales.get(currentMonthStr)?.get(u.id) || 0;
      if (currentSelfSales > 0 && u.role === "partner" && u.ancestors && u.ancestors.length > 0) {
        const partnerAncestors = u.ancestors.filter((id: string) => partnerIdSet.has(id));
        const len = partnerAncestors.length;
        const l1 = len >= 1 ? partnerAncestors[len - 1] : null;
        const l2 = len >= 2 ? partnerAncestors[len - 2] : null;
        const l3 = len >= 3 ? partnerAncestors[len - 3] : null;

        if (l1) l1SalesMap.set(l1, (l1SalesMap.get(l1) || 0) + currentSelfSales);
        if (l2) l2SalesMap.set(l2, (l2SalesMap.get(l2) || 0) + currentSelfSales);
        if (l3) l3SalesMap.set(l3, (l3SalesMap.get(l3) || 0) + currentSelfSales);
      }
    }

    // Step 2: Calculate metrics for all partners
    const rawData = [];
    
    for (const [userId, partner] of userMap.entries()) {
      if (partner.role !== "partner") continue;

      const selfSales = historicalSelfSales.get(currentMonthStr)?.get(userId) || 0;
      const teamSales = historicalTeamSales.get(currentMonthStr)?.get(userId) || 0;
      
      const l1Sales = l1SalesMap.get(userId) || 0;
      const l2Sales = l2SalesMap.get(userId) || 0;
      const l3Sales = l3SalesMap.get(userId) || 0;

      // Womaniyaa Point checks
      let meetsWPCurrent = teamSales >= 500000 && selfSales >= 10000;
      let newlyQualifiedWP = 0;
      if (meetsWPCurrent) {
        const m1Team = historicalTeamSales.get(monthsToCheck[1])?.get(userId) || 0;
        const m1Self = historicalSelfSales.get(monthsToCheck[1])?.get(userId) || 0;
        const m2Team = historicalTeamSales.get(monthsToCheck[2])?.get(userId) || 0;
        const m2Self = historicalSelfSales.get(monthsToCheck[2])?.get(userId) || 0;
        
        if (m1Team >= 500000 && m1Self >= 10000 && m2Team >= 500000 && m2Self >= 10000) {
          newlyQualifiedWP = 1;
        }
      }

      // Super Womaniyaa Point checks
      let meetsSWPCurrent = teamSales >= 25000000 && selfSales >= 25000;
      let newlyQualifiedSWP = 0;
      if (meetsSWPCurrent) {
        let swpValid = true;
        for (let i = 1; i <= 5; i++) {
          const mt = historicalTeamSales.get(monthsToCheck[i])?.get(userId) || 0;
          const ms = historicalSelfSales.get(monthsToCheck[i])?.get(userId) || 0;
          if (mt < 25000000 || ms < 25000) {
            swpValid = false;
            break;
          }
        }
        if (swpValid) newlyQualifiedSWP = 1;
      }

      const activeWPCount = (partner.partnerProfile?.womaniyaaPoints || []).filter((p: any) => p.expiryMonth >= currentMonthStr).length;
      const activeSWPCount = (partner.partnerProfile?.superWomaniyaaPoints || []).filter((p: any) => p.expiryMonth >= currentMonthStr).length;

      const totalWP = activeWPCount + newlyQualifiedWP;
      const totalSWP = activeSWPCount + newlyQualifiedSWP;

      rawData.push({
        partner,
        selfSales,
        teamSales,
        l1Sales,
        l2Sales,
        l3Sales,
        newlyQualifiedWP,
        newlyQualifiedSWP,
        totalWP,
        totalSWP
      });
    }

    // Step 3: Sum up all qualified points in the company to compute pool shares
    const totalWomaniyaaPointsCompany = rawData.reduce((acc, curr) => acc + curr.totalWP, 0);
    const totalSuperWomaniyaaPointsCompany = rawData.reduce((acc, curr) => acc + curr.totalSWP, 0);

    const totalPartnerTurnover = rawData.reduce((acc, curr) => acc + curr.selfSales, 0);

    const womaniyaaPool = totalPartnerTurnover * 0.01;
    const superWomaniyaaPool = totalPartnerTurnover * 0.01;

    const womaniyaaVal = totalWomaniyaaPointsCompany > 0 ? womaniyaaPool / totalWomaniyaaPointsCompany : 0;
    const superWomaniyaaVal = totalSuperWomaniyaaPointsCompany > 0 ? superWomaniyaaPool / totalSuperWomaniyaaPointsCompany : 0;

    const affiliateCommissions = await getAffiliateCommissionsForMonth(currentMonthStr);
    const affiliateByPartner = new Map<string, number>();
    for (const commission of affiliateCommissions) {
      affiliateByPartner.set(
        commission.sponsorId,
        (affiliateByPartner.get(commission.sponsorId) || 0) + commission.amount
      );
    }

    // Step 4: Compute final payouts for each partner
    const partnerPreviews = rawData.map((data) => {
      const selfLevelIncome = data.selfSales * 0.05;
      const l1Income = data.l1Sales * 0.02;
      const l2Income = data.l2Sales * 0.01;
      const l3Income = data.l3Sales * 0.005;
      const levelIncome = selfLevelIncome + l1Income + l2Income + l3Income;

      let monthlyBonus = 0;
      if (data.selfSales >= 100000) {
        monthlyBonus = data.selfSales * 0.02;
      } else if (data.selfSales >= 50000) {
        monthlyBonus = data.selfSales * 0.01;
      } else if (data.selfSales >= 25000) {
        monthlyBonus = data.selfSales * 0.005;
      }

      const womaniyaaIncome = data.totalWP * womaniyaaVal;
      const superWomaniyaaIncome = data.totalSWP * superWomaniyaaVal;
      const affiliateIncome = affiliateByPartner.get(data.partner.id) || 0;

      const totalEstimatedIncome = levelIncome + monthlyBonus + womaniyaaIncome + superWomaniyaaIncome + affiliateIncome;

      return {
        userId: data.partner.id,
        userName: data.partner.name || `${data.partner.firstName || ''} ${data.partner.lastName || ''}`.trim(),
        selfSales: data.selfSales,
        teamSales: data.teamSales,
        totalWP: data.totalWP,
        totalSWP: data.totalSWP,
        newlyQualifiedWP: data.newlyQualifiedWP,
        newlyQualifiedSWP: data.newlyQualifiedSWP,
        levelIncome,
        monthlyBonus,
        womaniyaaIncome,
        superWomaniyaaIncome,
        affiliateIncome,
        totalEstimatedIncome
      };
    });

    res.json({
      month,
      totalCompanySales,
      totalPayoutsGenerated: partnerPreviews.reduce((acc, curr) => acc + curr.totalEstimatedIncome, 0),
      partnerPreviews: partnerPreviews.filter(p => p.totalEstimatedIncome > 0)
    });
  } catch (error) {
    console.error("Error generating closing preview:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function getExpiryMonth(monthStr: string, addMonths: number): string {
  let [year, month] = monthStr.split("-").map(Number);
  month += addMonths;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  return `${year}-${month.toString().padStart(2, '0')}`;
}

export const executeClosing = async (req: Request, res: Response) => {
  try {
    const { month, previews } = req.body;
    if (!month || !previews) return res.status(400).json({ error: "Invalid data" });

    if (!isTenthInIndia()) {
      return res.status(400).json({ error: "Monthly commissions can only be credited on the 10th (Asia/Kolkata)." });
    }

    // Look for existing locked month
    const existingLedgers = await IncomeLedger.findOne({ month, incomeType: "Level Income" });
    if (existingLedgers) {
      return res.status(400).json({ error: "Month already closed and locked." });
    }

    const now = new Date().toISOString();
    const affiliateCommissions = await getAffiliateCommissionsForMonth(month);
    const affiliateByPartner = new Map<string, AffiliateCommission[]>();
    for (const commission of affiliateCommissions) {
      const list = affiliateByPartner.get(commission.sponsorId) || [];
      list.push(commission);
      affiliateByPartner.set(commission.sponsorId, list);
    }

    await reverseInvalidAffiliateCommissions(now);

    for (const preview of previews) {
      // Affiliate income is always recalculated on the server. Never trust a
      // client-supplied preview for money movement.
      const partnerAffiliateCommissions = affiliateByPartner.get(preview.userId) || [];
      const affiliateIncome = partnerAffiliateCommissions.reduce((sum, item) => sum + item.amount, 0);
      const closingIncomeAmount = (preview.levelIncome || 0) + 
                            (preview.monthlyBonus || 0) + 
                            (preview.womaniyaaIncome || 0) + 
                            (preview.superWomaniyaaIncome || 0) +
                            affiliateIncome;

      // We still want to update WP/SWP arrays even if closing income is 0, just in case they earned a point.
      const user = await User.findOne({ id: preview.userId });
      if (user) {
        let profile = user.partnerProfile || {};
        profile.womaniyaaPoints = profile.womaniyaaPoints || [];
        profile.superWomaniyaaPoints = profile.superWomaniyaaPoints || [];

        if (preview.newlyQualifiedWP > 0) {
          for (let i = 0; i < preview.newlyQualifiedWP; i++) {
            profile.womaniyaaPoints.push({ awardedMonth: month, expiryMonth: getExpiryMonth(month, 11) });
          }
        }

        if (preview.newlyQualifiedSWP > 0) {
          for (let i = 0; i < preview.newlyQualifiedSWP; i++) {
            profile.superWomaniyaaPoints.push({ awardedMonth: month, expiryMonth: getExpiryMonth(month, 35) });
          }
        }
        
        let updateQuery: any = { partnerProfile: profile };
        if (closingIncomeAmount > 0) {
          const currentBalance = profile.networkWalletBalance || 0;
          profile.networkWalletBalance = currentBalance + closingIncomeAmount;
          updateQuery = { partnerProfile: profile };
        }
        
        await User.findOneAndUpdate({ id: preview.userId }, updateQuery);
      }

      if (closingIncomeAmount <= 0) continue;

      // Log specific income types in ledgers
      // Log to WalletTransaction as well
      const { WalletTransaction } = await import("../models/WalletTransaction");

      for (const commission of partnerAffiliateCommissions) {
        await IncomeLedger.create({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Affiliate Income",
          amount: commission.amount,
          status: "approved",
          remarks: `5% first delivered-order commission for order ${commission.orderId}`,
          createdAt: now,
          updatedAt: now
        });
        await WalletTransaction.create({
          id: crypto.randomUUID(),
          userId: preview.userId,
          amount: commission.amount,
          type: "CREDIT",
          source: "Affiliate Link",
          description: `5% First Delivered Order Commission from ${commission.customerName}`,
          orderId: commission.orderId,
          referralCustomerId: commission.customerId,
          commissionMonth: month,
          createdAt: now,
          updatedAt: now
        });
      }
      
      if (preview.levelIncome > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Level Income",
          amount: preview.levelIncome,
          sellPointsBasis: preview.selfSales,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
        
        await WalletTransaction.create({
          id: crypto.randomUUID(),
          userId: preview.userId,
          amount: preview.levelIncome,
          type: "CREDIT",
          source: "Network Income",
          description: `Network Level Income for ${month}`,
          createdAt: now,
          updatedAt: now
        });
      }

      if (preview.monthlyBonus > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Monthly Bonus",
          amount: preview.monthlyBonus,
          sellPointsBasis: preview.selfSales,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
      }

      if (preview.womaniyaaIncome > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Womaniyaa Point Income",
          amount: preview.womaniyaaIncome,
          sellPointsBasis: preview.teamSales,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
        
        await WalletTransaction.create({
          id: crypto.randomUUID(),
          userId: preview.userId,
          amount: preview.womaniyaaIncome,
          type: "CREDIT",
          source: "Womaniyaa Point",
          description: `Womaniyaa Point Pool Share for ${month}`,
          createdAt: now,
          updatedAt: now
        });
      }

      if (preview.superWomaniyaaIncome > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Super Womaniyaa Point Income",
          amount: preview.superWomaniyaaIncome,
          sellPointsBasis: preview.teamSales,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
        
        await WalletTransaction.create({
          id: crypto.randomUUID(),
          userId: preview.userId,
          amount: preview.superWomaniyaaIncome,
          type: "CREDIT",
          source: "Super Womaniyaa Point",
          description: `Super Womaniyaa Point Pool Share for ${month}`,
          createdAt: now,
          updatedAt: now
        });
      }

      // Generate Withdrawal record for payout tracking
      const payoutUser = await User.findOne({ id: preview.userId });
      const kycVerified = payoutUser?.partnerProfile?.kycStatus === "Approved";
      const activeDirects = 2; // Mock

      await new Payout({
        id: crypto.randomUUID(),
        userId: preview.userId,
        month,
        amount: closingIncomeAmount,
        sellPointsBasis: preview.selfSales,
        activeDirectsBasis: activeDirects,
        kycVerified,
        status: "Pending",
        createdAt: now,
        updatedAt: now
      }).save();

      // Credit the total closing income amount to the user's wallet
      await User.findOneAndUpdate(
        { id: preview.userId },
        { $inc: { "partnerProfile.walletBalance": closingIncomeAmount } }
      );
      
      // Wallet balance is updated along with WP/SWP arrays above.
    }

    res.json({ success: true, message: `Successfully locked month ${month} and generated ledgers.` });
  } catch (error) {
    console.error("Error executing closing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const runAutomatedMonthlyClosing = async () => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); 
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

  try {
    console.log(`[Auto Closing] Starting automated closing for month: ${monthStr}`);

    const req = { query: { month: monthStr } } as any;
    let previews: any = null;
    const res = {
      json: (data: any) => { 
        if (data && data.partnerPreviews) {
          previews = data.partnerPreviews; 
        }
      },
      status: () => res
    } as any;

    await getClosingPreview(req, res);

    if (!previews) {
      console.log(`[Auto Closing] Failed to generate previews for ${monthStr}`);
      return;
    }

    const execReq = { body: { month: monthStr, previews } } as any;
    let execResult = null;
    const execRes = {
      json: (data: any) => { execResult = data; },
      status: () => execRes
    } as any;

    await executeClosing(execReq, execRes);
    console.log(`[Auto Closing] Finished:`, execResult);

  } catch (error) {
    console.error(`[Auto Closing] Error running automated closing for ${monthStr}:`, error);
  }
};

export const lockCurrentSalesMonth = async () => {
  const now = new Date();
  if (!isLastDayInIndia(now)) return;

  const month = getClosingMonth(now);
  const eligibleLedgers = await SellPointLedger.aggregate([
    { $match: { salesMonth: month, status: "approved", type: "Credit" } },
    { $lookup: { from: "orders", localField: "orderId", foreignField: "id", as: "order" } },
    { $unwind: "$order" },
    {
      $match: {
        "order.status": "Delivered",
        $or: [
          { "order.paymentStatus": "Paid" },
          { "order.paymentMethod": { $regex: /cod|cash on delivery/i } },
          { "order.paymentStatus": { $regex: /cod/i } }
        ]
      }
    },
    { $count: "count" }
  ]);

  await SalesMonthClose.findOneAndUpdate(
    { month },
    {
      $setOnInsert: {
        month,
        status: "Locked",
        deliveredOrderCount: eligibleLedgers[0]?.count || 0,
        lockedAt: now.toISOString()
      }
    },
    { upsert: true, new: true }
  );
  console.log(`[Sales Close] Locked ${month} at 11:59 PM Asia/Kolkata.`);
};
