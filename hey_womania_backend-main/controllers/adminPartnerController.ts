import { Request, Response } from "express";
import { User } from "../models/User";
import { SellPointLedger } from "../models/SellPointLedger";

export const getPartners = async (req: Request, res: Response) => {
  try {
    const partners = await User.find({ role: "partner" }).select("-passwordHash");
    
    // Enrich with ledger data and upline/downline info
    const enrichedPartners = await Promise.all(partners.map(async (partner) => {
      // Find active directs (users where uplineId is this partner's id)
      const directsCount = await User.countDocuments({ uplineId: partner.id, role: "partner" });
      
      // Calculate personal approved sell points
      const personalLedgers = await SellPointLedger.find({ userId: partner.id, status: "approved" });
      const personalSellPoints = personalLedgers.reduce((sum, entry) => {
        return entry.type === "Credit" ? sum + entry.sellPoints : sum - entry.sellPoints;
      }, 0);

      // (Team sell points would be calculated recursively in a real scenario, 
      // but we will do a simplified version here for Phase 9)
      const teamSellPoints = 0; // Placeholder until tree recursion is built
      
      const sponsor = partner.uplineId ? await User.findOne({ id: partner.uplineId }) : null;

      return {
        id: partner.id,
        name: partner.name || `${partner.firstName || ''} ${partner.lastName || ''}`.trim(),
        email: partner.email,
        phone: partner.phone,
        referralCode: partner.referralCode,
        sponsorName: sponsor ? sponsor.name : "None",
        activeDirects: directsCount,
        personalSellPoints,
        teamSellPoints,
        walletBalance: partner.partnerProfile?.walletBalance || 0,
        kycStatus: partner.partnerProfile?.kycStatus || "Pending",
        payoutStatus: "Eligible" // Mocked until Phase 11
      };
    }));

    res.json(enrichedPartners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSellPointLedgers = async (req: Request, res: Response) => {
  try {
    const ledgers = await SellPointLedger.find().sort({ createdAt: -1 });
    
    // Enrich with User details
    const enrichedLedgers = await Promise.all(ledgers.map(async (ledger) => {
      const user = await User.findOne({ id: ledger.userId });
      return {
        ...ledger.toObject(),
        userName: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : "Unknown User"
      };
    }));

    res.json(enrichedLedgers);
  } catch (error) {
    console.error("Error fetching sell point ledgers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
