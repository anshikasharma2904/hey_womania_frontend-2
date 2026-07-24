import { Request, Response } from "express";
import crypto from "crypto";
import { PartnerDashboard } from "../models/PartnerDashboard";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { IncomeLedger } from "../models/IncomeLedger";

const SELL_POINTS_RULES = {
  formula: "Selling price ÷ 5 = Sell Points",
  minimumPayoutSellPoints: 500,
  minimumActiveDirects: 2,
  selfSellIncome: "10%",
  fastTrackIncome: ["5%", "3%", "2%"],
  scoreIncome: {
    glam: "2,500 sell points -> 1 Glam Score -> 15% pool",
    style: "25,000 sell points -> 1 Style Score -> 12% pool",
    gorgeous: "100,000 sell points -> 1 Gorgeous Score -> 10% pool",
    superWomenia: "2 Gorgeous Scores in one month -> 1 Super Womenia Score -> 10% pool"
  },
  dreamFunds: {
    dreamCar: "3 continuous months of 1 Gorgeous Score -> Dream Car Fund",
    dreamHouse: "3 continuous months of 200,000 sell points + 1 Super Womenia Score -> Dream House Fund"
  },
  partnershipBonus: "Unlocks after Style Score; 5-level bonus",
  smartSellerPool: "3 continuous months of 10,000 sell points -> 12-month pool share",
  annualClubs: {
    superClub: "50 lakh yearly sell points -> 1% pool",
    megaClub: "2 crore yearly sell points -> 1.5% pool",
    luxuryLifeClub: "5 crore yearly sell points -> 2.5% pool"
  },
  timelyRewards: "Weekly, monthly, and festival bonanzas"
} as const;

async function ensureDashboard(userId: string) {
  const now = new Date().toISOString();
  let dashboard = await PartnerDashboard.findOne({ userId });

  if (!dashboard) {
    dashboard = await PartnerDashboard.create({
      userId,
      totalOrders: 0,
      totalReferrals: 0,
      walletBalance: 0,
      rank: "Starter",
      sellPriceTotal: 0,
      sellPointsTotal: 0,
      activeDirects: 0,
      selfSellIncome: 0,
      fastTrackIncome: 0,
      scoreIncome: 0,
      dreamCarFundIncome: 0,
      dreamHouseFundIncome: 0,
      partnershipBonusIncome: 0,
      smartSellerPoolIncome: 0,
      annualClubIncome: 0,
      timelyRewardsIncome: 0,
      kycVerified: false,
      nomineeDetails: {
        nomineeName: "",
        nomineeRelation: "",
        nomineeAge: "",
        nomineeDob: ""
      },
      createdAt: now,
      updatedAt: now
    });
  }

  return dashboard;
}

export const getPartnerDashboard = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = await User.findOne({ id: userId }).select("-passwordHash");
    const totalOrders = await Order.countDocuments({ userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "partner" && user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. User is not a registered partner." });
    }

    const dashboard = await ensureDashboard(userId);
    const recentOrder = await Order.findOne({ userId }).sort({ createdAt: -1 });

    res.json({
      user,
      dashboard: {
        ...dashboard.toObject(),
        totalOrders: dashboard.totalOrders ?? totalOrders ?? 0,
        totalReferrals: dashboard.totalReferrals ?? user.teamIds?.length ?? 0,
        walletBalance: dashboard.walletBalance ?? 0,
        rank: dashboard.rank || user.rank || "Starter"
      },
      recentOrder,
      businessPlan: SELL_POINTS_RULES
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePartnerDashboard = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const payload = req.body as Partial<{
      totalOrders: number;
      totalReferrals: number;
      walletBalance: number;
      rank: string;
      sellPriceTotal: number;
      sellPointsTotal: number;
      activeDirects: number;
      selfSellIncome: number;
      fastTrackIncome: number;
      scoreIncome: number;
      dreamCarFundIncome: number;
      dreamHouseFundIncome: number;
      partnershipBonusIncome: number;
      smartSellerPoolIncome: number;
      annualClubIncome: number;
      timelyRewardsIncome: number;
      kycVerified: boolean;
      nomineeDetails: {
        nomineeName: string;
        nomineeRelation: string;
        nomineeAge: string;
        nomineeDob: string;
      };
    }>;

    const user = await User.findOne({ id: userId });
    if (!user || (user.role !== "partner" && user.role !== "admin")) {
      return res.status(403).json({ error: "Access denied. User is not a registered partner." });
    }

    const dashboard = await ensureDashboard(userId);

    if (typeof payload.totalOrders === "number") dashboard.totalOrders = payload.totalOrders;
    if (typeof payload.totalReferrals === "number") dashboard.totalReferrals = payload.totalReferrals;
    if (typeof payload.walletBalance === "number") dashboard.walletBalance = payload.walletBalance;
    if (typeof payload.rank === "string") dashboard.rank = payload.rank.trim() || dashboard.rank;
    if (typeof payload.sellPriceTotal === "number") dashboard.sellPriceTotal = payload.sellPriceTotal;
    if (typeof payload.sellPointsTotal === "number") dashboard.sellPointsTotal = payload.sellPointsTotal;
    if (typeof payload.activeDirects === "number") dashboard.activeDirects = payload.activeDirects;
    if (typeof payload.selfSellIncome === "number") dashboard.selfSellIncome = payload.selfSellIncome;
    if (typeof payload.fastTrackIncome === "number") dashboard.fastTrackIncome = payload.fastTrackIncome;
    if (typeof payload.scoreIncome === "number") dashboard.scoreIncome = payload.scoreIncome;
    if (typeof payload.dreamCarFundIncome === "number") dashboard.dreamCarFundIncome = payload.dreamCarFundIncome;
    if (typeof payload.dreamHouseFundIncome === "number") dashboard.dreamHouseFundIncome = payload.dreamHouseFundIncome;
    if (typeof payload.partnershipBonusIncome === "number") dashboard.partnershipBonusIncome = payload.partnershipBonusIncome;
    if (typeof payload.smartSellerPoolIncome === "number") dashboard.smartSellerPoolIncome = payload.smartSellerPoolIncome;
    if (typeof payload.annualClubIncome === "number") dashboard.annualClubIncome = payload.annualClubIncome;
    if (typeof payload.timelyRewardsIncome === "number") dashboard.timelyRewardsIncome = payload.timelyRewardsIncome;
    if (typeof payload.kycVerified === "boolean") dashboard.kycVerified = payload.kycVerified;
    if (payload.nomineeDetails) {
      dashboard.nomineeDetails = {
        nomineeName: payload.nomineeDetails.nomineeName?.trim() ?? "",
        nomineeRelation: payload.nomineeDetails.nomineeRelation?.trim() ?? "",
        nomineeAge: payload.nomineeDetails.nomineeAge?.trim() ?? "",
        nomineeDob: payload.nomineeDetails.nomineeDob?.trim() ?? ""
      };
    }

    dashboard.updatedAt = new Date().toISOString();
    await dashboard.save();

    res.json({ success: true, dashboard });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPartnerIncomeLedgers = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const ledgers = await IncomeLedger.find({ userId }).sort({ createdAt: -1 });
    res.json({ ok: true, ledgers });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

export const getPartnerReferrals = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const getStats = async (u: any) => {
      const ordersCount = await Order.countDocuments({ userId: u.id });
      const orders = await Order.find({ userId: u.id });
      let totalSP = 0;
      for (const order of orders) {
        if (order.status === "Delivered") {
          const numericTotal = parseFloat((order.total || "").replace(/[^0-9.]/g, ""));
          if (!isNaN(numericTotal)) {
            totalSP += numericTotal / 5;
          }
        }
      }
      return {
        id: u.id,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || "Independent Partner",
        email: u.email,
        phone: u.phone,
        dateJoined: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : "2026-06-24",
        ordersCount,
        totalSP,
        status: ordersCount > 0 ? "Active" : "Inactive"
      };
    };

    const l1Ids = user.teamIds || [];
    const l1Users = await User.find({ id: { $in: l1Ids } });
    const level1 = await Promise.all(l1Users.map(async (u) => {
      const stats = await getStats(u);
      return { ...stats, uplineId: userId, level: 1 };
    }));

    const level2: any[] = [];
    for (const l1 of l1Users) {
      const l2Ids = l1.teamIds || [];
      if (l2Ids.length > 0) {
        const l2Users = await User.find({ id: { $in: l2Ids } });
        const mapped = await Promise.all(l2Users.map(async (u) => {
          const stats = await getStats(u);
          return { ...stats, uplineId: l1.id, level: 2 };
        }));
        level2.push(...mapped);
      }
    }

    const level3: any[] = [];
    for (const l2 of level2) {
      const l2UserObj = await User.findOne({ id: l2.id });
      if (l2UserObj) {
        const l3Ids = l2UserObj.teamIds || [];
        if (l3Ids.length > 0) {
          const l3Users = await User.find({ id: { $in: l3Ids } });
          const mapped = await Promise.all(l3Users.map(async (u) => {
            const stats = await getStats(u);
            return { ...stats, uplineId: l2.id, level: 3 };
          }));
          level3.push(...mapped);
        }
      }
    }

    res.json({
      ok: true,
      level1,
      level2,
      level3
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};
