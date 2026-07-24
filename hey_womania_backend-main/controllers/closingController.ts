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

function getPrevMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  return `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;
}

async function checkTeamSpForMonth(partnerId: string, monthStr: string): Promise<number> {
  const ledgers = await SellPointLedger.find({
    status: "approved",
    createdAt: { $regex: `^${monthStr}` }
  });
  const downlineIds = await getDownlineIds(partnerId);
  const teamUserIds = [partnerId, ...downlineIds];
  const teamLedgers = ledgers.filter(l => teamUserIds.includes(l.userId));
  return teamLedgers.reduce((acc, curr) => {
    return curr.type === "Credit" ? acc + curr.sellPoints : acc - curr.sellPoints;
  }, 0);
}

export const getClosingPreview = async (req: Request, res: Response) => {
  try {
    const { month } = req.query; // e.g. "2026-05"
    if (!month) return res.status(400).json({ error: "Month parameter is required (YYYY-MM)" });

    const ledgers = await SellPointLedger.find({ 
      status: "approved", 
      createdAt: { $regex: `^${month}` } 
    });

    const totalCompanySp = ledgers.reduce((acc, curr) => {
      return curr.type === "Credit" ? acc + curr.sellPoints : acc - curr.sellPoints;
    }, 0);

    const partners = await User.find({ role: "partner" });

    // Step 1: Calculate raw metrics and score targets for all partners
    const rawData = await Promise.all(partners.map(async (partner) => {
      const downlineIds = await getDownlineIds(partner.id);
      const teamUserIds = [partner.id, ...downlineIds];
      
      // Personal SP
      const partnerLedgers = ledgers.filter(l => l.userId === partner.id);
      const personalSp = partnerLedgers.reduce((acc, curr) => {
        return curr.type === "Credit" ? acc + curr.sellPoints : acc - curr.sellPoints;
      }, 0);

      // Team SP
      const teamLedgers = ledgers.filter(l => teamUserIds.includes(l.userId));
      const teamSp = teamLedgers.reduce((acc, curr) => {
        return curr.type === "Credit" ? acc + curr.sellPoints : acc - curr.sellPoints;
      }, 0);

      // Independent quotient calculations
      const glamScores = Math.floor(teamSp / 2500);
      const styleScores = Math.floor(teamSp / 25000);
      const gorgeousScores = Math.floor(teamSp / 100000);
      const superWomaniaScores = Math.floor(teamSp / 200000);

      // 3 consecutive months lookback checks
      const prevMonth1 = getPrevMonth(month.toString());
      const prevMonth2 = getPrevMonth(prevMonth1);
      const prevMonth3 = getPrevMonth(prevMonth2);

      const hitCarCurrent = teamSp >= 100000;
      const hitCarMonth1 = await checkTeamSpForMonth(partner.id, prevMonth1) >= 100000;
      const hitCarMonth2 = await checkTeamSpForMonth(partner.id, prevMonth2) >= 100000;
      const hitCarMonth3 = await checkTeamSpForMonth(partner.id, prevMonth3) >= 100000;

      // Qualified if currently hitting, and hit either (last 2 months) OR (month-2 and month-3 with a 1-month buffer)
      const qualifiesDreamCar = (hitCarCurrent && hitCarMonth1 && hitCarMonth2) || 
                                 (hitCarCurrent && hitCarMonth2 && hitCarMonth3);

      const hitHouseCurrent = teamSp >= 200000;
      const hitHouseMonth1 = await checkTeamSpForMonth(partner.id, prevMonth1) >= 200000;
      const hitHouseMonth2 = await checkTeamSpForMonth(partner.id, prevMonth2) >= 200000;
      const hitHouseMonth3 = await checkTeamSpForMonth(partner.id, prevMonth3) >= 200000;

      const qualifiesDreamHouse = (hitHouseCurrent && hitHouseMonth1 && hitHouseMonth2) || 
                                   (hitHouseCurrent && hitHouseMonth2 && hitHouseMonth3);

      return {
        partner,
        personalSp,
        teamSp,
        glamScores,
        styleScores,
        gorgeousScores,
        superWomaniaScores,
        qualifiesDreamCar,
        qualifiesDreamHouse
      };
    }));

    // Step 2: Sum up all qualified scores in the company to compute pool shares
    const totalGlamScores = rawData.reduce((acc, curr) => acc + curr.glamScores, 0);
    const totalStyleScores = rawData.reduce((acc, curr) => acc + curr.styleScores, 0);
    const totalGorgeousScores = rawData.reduce((acc, curr) => acc + curr.gorgeousScores, 0);
    const totalSuperWomaniaScores = rawData.reduce((acc, curr) => acc + curr.superWomaniaScores, 0);
    const totalDreamCarFundScores = rawData.reduce((acc, curr) => acc + (curr.qualifiesDreamCar ? 1 : 0), 0);
    const totalDreamHouseFundScores = rawData.reduce((acc, curr) => acc + (curr.qualifiesDreamHouse ? 1 : 0), 0);

    // Pool Volumes (Turnover SP * pool percentage)
    const glamPool = totalCompanySp * 0.15;
    const stylePool = totalCompanySp * 0.12;
    const gorgeousPool = totalCompanySp * 0.10;
    const superWomaniaPool = totalCompanySp * 0.10;
    const dreamCarPool = totalCompanySp * 0.05;
    const dreamHousePool = totalCompanySp * 0.05;

    // Value Per Score (Pool divided by total company scores)
    const glamVal = totalGlamScores > 0 ? glamPool / totalGlamScores : 0;
    const styleVal = totalStyleScores > 0 ? stylePool / totalStyleScores : 0;
    const gorgeousVal = totalGorgeousScores > 0 ? gorgeousPool / totalGorgeousScores : 0;
    const superWomaniaVal = totalSuperWomaniaScores > 0 ? superWomaniaPool / totalSuperWomaniaScores : 0;
    const dreamCarVal = totalDreamCarFundScores > 0 ? dreamCarPool / totalDreamCarFundScores : 0;
    const dreamHouseVal = totalDreamHouseFundScores > 0 ? dreamHousePool / totalDreamHouseFundScores : 0;

    // Step 3: Compute final payouts for each partner
    const partnerPreviews = rawData.map((data) => {
      const glamIncome = data.glamScores * glamVal;
      const styleIncome = data.styleScores * styleVal;
      const gorgeousIncome = data.gorgeousScores * gorgeousVal;
      const superWomaniaIncome = data.superWomaniaScores * superWomaniaVal;
      const dreamCarIncome = data.qualifiesDreamCar ? dreamCarVal : 0;
      const dreamHouseIncome = data.qualifiesDreamHouse ? dreamHouseVal : 0;

      const totalEstimatedIncome = glamIncome + styleIncome + gorgeousIncome + superWomaniaIncome + dreamCarIncome + dreamHouseIncome;

      return {
        userId: data.partner.id,
        userName: data.partner.name || `${data.partner.firstName || ''} ${data.partner.lastName || ''}`.trim(),
        personalSp: data.personalSp,
        teamSp: data.teamSp,
        glamScores: data.glamScores,
        styleScores: data.styleScores,
        gorgeousScores: data.gorgeousScores,
        superWomaniaScores: data.superWomaniaScores,
        qualifiesDreamCar: data.qualifiesDreamCar,
        qualifiesDreamHouse: data.qualifiesDreamHouse,
        glamIncome,
        styleIncome,
        gorgeousIncome,
        superWomaniaIncome,
        dreamCarIncome,
        dreamHouseIncome,
        totalEstimatedIncome
      };
    });

    res.json({
      month,
      totalCompanySp,
      totalPayoutsGenerated: partnerPreviews.reduce((acc, curr) => acc + curr.totalEstimatedIncome, 0),
      partnerPreviews: partnerPreviews.filter(p => p.totalEstimatedIncome > 0)
    });
  } catch (error) {
    console.error("Error generating closing preview:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const executeClosing = async (req: Request, res: Response) => {
  try {
    const { month, previews } = req.body;
    if (!month || !previews) return res.status(400).json({ error: "Invalid data" });

    const existingLedgers = await IncomeLedger.findOne({ month, incomeType: { $ne: "Self Sell Income" } });
    if (existingLedgers) {
      return res.status(400).json({ error: "Month already closed and locked." });
    }

    const now = new Date().toISOString();

    for (const preview of previews) {
      const closingIncomeAmount = (preview.glamIncome || 0) + 
                            (preview.styleIncome || 0) + 
                            (preview.gorgeousIncome || 0) + 
                            (preview.superWomaniaIncome || 0) + 
                            (preview.dreamCarIncome || 0) + 
                            (preview.dreamHouseIncome || 0);

      if (closingIncomeAmount <= 0) continue;

      // Log specific income types in ledgers
      if (preview.glamIncome > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Glam Score",
          amount: preview.glamIncome,
          sellPointsBasis: preview.teamSp,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
      }

      if (preview.styleIncome > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Style Score",
          amount: preview.styleIncome,
          sellPointsBasis: preview.teamSp,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
      }

      if (preview.gorgeousIncome > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Gorgeous Score",
          amount: preview.gorgeousIncome,
          sellPointsBasis: preview.teamSp,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
      }

      if (preview.superWomaniaIncome > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Super Womania Score",
          amount: preview.superWomaniaIncome,
          sellPointsBasis: preview.teamSp,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
      }

      if (preview.dreamCarIncome > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Dream Car Fund",
          amount: preview.dreamCarIncome,
          sellPointsBasis: preview.teamSp,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
      }

      if (preview.dreamHouseIncome > 0) {
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: preview.userId,
          month,
          incomeType: "Dream House Fund",
          amount: preview.dreamHouseIncome,
          sellPointsBasis: preview.teamSp,
          status: "approved",
          createdAt: now,
          updatedAt: now
        }).save();
      }

      // Generate Withdrawal record for payout tracking
      const user = await User.findOne({ id: preview.userId });
      const kycVerified = user?.partnerProfile?.kycStatus === "Approved";
      const activeDirects = 2; // Mock

      await new Payout({
        id: crypto.randomUUID(),
        userId: preview.userId,
        month,
        amount: closingIncomeAmount,
        sellPointsBasis: preview.personalSp,
        activeDirectsBasis: activeDirects,
        kycVerified,
        status: "Pending",
        createdAt: now,
        updatedAt: now
      }).save();

      // Update user wallet balance with closing incomes
      if (user) {
        const currentBalance = user.partnerProfile?.walletBalance || 0;
        await User.findOneAndUpdate(
          { id: preview.userId },
          { "partnerProfile.walletBalance": currentBalance + closingIncomeAmount }
        );
      }
    }

    res.json({ success: true, message: `Successfully locked month ${month} and generated ledgers.` });
  } catch (error) {
    console.error("Error executing closing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
