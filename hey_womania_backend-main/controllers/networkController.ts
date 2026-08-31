import { Request, Response } from "express";
import { User } from "../models/User";
import { SellPointLedger } from "../models/SellPointLedger";

export const getNetworkTree = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Level 1: direct referrals
    const level1Users = await User.find({ uplineId: userId, role: "partner" }, { id: 1, name: 1, firstName: 1, lastName: 1, email: 1, phone: 1, createdAt: 1, rank: 1, partnerProfile: 1 });
    const level1Ids = level1Users.map(u => u.id);

    // Level 2: referrals of level 1
    const level2Users = level1Ids.length > 0 ? await User.find({ uplineId: { $in: level1Ids }, role: "partner" }, { id: 1, name: 1, firstName: 1, lastName: 1, email: 1, phone: 1, createdAt: 1, rank: 1, uplineId: 1, partnerProfile: 1 }) : [];
    const level2Ids = level2Users.map(u => u.id);

    // Level 3: referrals of level 2
    const level3Users = level2Ids.length > 0 ? await User.find({ uplineId: { $in: level2Ids }, role: "partner" }, { id: 1, name: 1, firstName: 1, lastName: 1, email: 1, phone: 1, createdAt: 1, rank: 1, uplineId: 1, partnerProfile: 1 }) : [];

    // Optionally calculate total sales for each user by checking SellPointLedger
    const allIds = [...level1Ids, ...level2Ids, ...level3Users.map(u => u.id)];
    let salesMap: Record<string, number> = {};
    
    if (allIds.length > 0) {
      const ledgers = await SellPointLedger.find({ userId: { $in: allIds }, status: "approved" });
      ledgers.forEach(l => {
        if (l.type === "Credit") {
          salesMap[l.userId] = (salesMap[l.userId] || 0) + (l.sellPrice || 0);
        } else {
          salesMap[l.userId] = (salesMap[l.userId] || 0) - (l.sellPrice || 0);
        }
      });
    }

    const mapUser = (u: any) => ({
      id: u.id,
      name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      email: u.email,
      phone: u.phone,
      joinedAt: u.createdAt,
      rank: u.rank || "Starter",
      kycStatus: u.partnerProfile?.kycStatus || "Pending",
      totalSales: salesMap[u.id] || 0
    });

    res.json({
      success: true,
      data: {
        level1: level1Users.map(mapUser),
        level2: level2Users.map(mapUser),
        level3: level3Users.map(mapUser)
      }
    });

  } catch (error) {
    console.error("Error fetching network tree:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
