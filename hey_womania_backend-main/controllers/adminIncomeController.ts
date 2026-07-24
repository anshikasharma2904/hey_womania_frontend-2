import { Request, Response } from "express";
import { IncomeLedger } from "../models/IncomeLedger";
import { User } from "../models/User";

export const getIncomeLedgers = async (req: Request, res: Response) => {
  try {
    const ledgers = await IncomeLedger.find().sort({ createdAt: -1 });
    
    // Enrich with User details
    const enrichedLedgers = await Promise.all(ledgers.map(async (ledger) => {
      const user = await User.findOne({ id: ledger.userId });
      return {
        ...ledger.toObject(),
        userName: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : "Unknown User",
        referralCode: user?.referralCode || "N/A"
      };
    }));

    res.json(enrichedLedgers);
  } catch (error) {
    console.error("Error fetching income ledgers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
