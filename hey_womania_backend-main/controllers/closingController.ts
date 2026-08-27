import { Request, Response } from "express";
import { User } from "../models/User";
import { SellPointLedger } from "../models/SellPointLedger";
import { IncomeLedger } from "../models/IncomeLedger";
import { Payout } from "../models/Payout";
import crypto from "crypto";

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
  const teamUsers = await User.find({ $or: [{ id: partnerId }, { ancestors: partnerId }] }, { id: 1 }).lean();
  const teamUserIds = teamUsers.map(u => u.id);

  const result = await SellPointLedger.aggregate([
    {
      $match: {
        status: "approved",
        createdAt: { $regex: `^${monthStr}` },
        userId: { $in: teamUserIds }
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
          createdAt: { $regex: new RegExp(`^(${monthsToCheck.join("|")})`) }
        }
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            month: { $substr: ["$createdAt", 0, 7] }
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
    
    const usersCursor = User.find({}, { id: 1, name: 1, firstName: 1, lastName: 1, ancestors: 1, partnerProfile: 1, role: 1 }).cursor();
    for await (const u of usersCursor) {
      userMap.set(u.id, u);

      for (const m of monthsToCheck) {
        const selfSales = historicalSelfSales.get(m)?.get(u.id) || 0;
        if (selfSales === 0) continue;
        
        const mTeamMap = historicalTeamSales.get(m);
        mTeamMap.set(u.id, (mTeamMap.get(u.id) || 0) + selfSales);
        
        for (const anc of (u.ancestors || [])) {
          mTeamMap.set(anc, (mTeamMap.get(anc) || 0) + selfSales);
        }
      }

      // Compute L1/L2/L3 bases for current month
      const currentSelfSales = historicalSelfSales.get(currentMonthStr)?.get(u.id) || 0;
      if (currentSelfSales > 0 && u.ancestors && u.ancestors.length > 0) {
        const len = u.ancestors.length;
        const l1 = len >= 1 ? u.ancestors[len - 1] : null;
        const l2 = len >= 2 ? u.ancestors[len - 2] : null;
        const l3 = len >= 3 ? u.ancestors[len - 3] : null;

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

      const totalEstimatedIncome = levelIncome + monthlyBonus + womaniyaaIncome + superWomaniyaaIncome;

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

    // Look for existing locked month
    const existingLedgers = await IncomeLedger.findOne({ month, incomeType: "Level Income" });
    if (existingLedgers) {
      return res.status(400).json({ error: "Month already closed and locked." });
    }

    const now = new Date().toISOString();

    for (const preview of previews) {
      const closingIncomeAmount = (preview.levelIncome || 0) + 
                            (preview.monthlyBonus || 0) + 
                            (preview.womaniyaaIncome || 0) + 
                            (preview.superWomaniyaaIncome || 0);

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
