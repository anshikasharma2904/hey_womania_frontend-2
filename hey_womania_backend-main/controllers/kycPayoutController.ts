import { Request, Response } from "express";
import { Kyc } from "../models/Kyc";
import { Payout } from "../models/Payout";
import { User } from "../models/User";

// KYC Management
export const getKycs = async (req: Request, res: Response) => {
  try {
    const kycs = await Kyc.find().sort({ createdAt: -1 });
    const enrichedKycs = await Promise.all(kycs.map(async (kyc) => {
      const user = await User.findOne({ id: kyc.userId });
      return {
        ...kyc.toObject(),
        userName: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : "Unknown User",
        userEmail: user?.email || ""
      };
    }));
    res.json(enrichedKycs);
  } catch (error) {
    console.error("Error fetching KYCs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateKycStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    const kyc = await Kyc.findOneAndUpdate(
      { id },
      { status, rejectionReason, updatedAt: new Date().toISOString() },
      { new: true }
    );

    if (!kyc) return res.status(404).json({ error: "KYC not found" });

    // Update user profile kycStatus
    if (kyc.userId) {
      await User.findOneAndUpdate(
        { id: kyc.userId },
        { "partnerProfile.kycStatus": status }
      );
    }

    res.json({ success: true, kyc });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Payout Management
export const getPayouts = async (req: Request, res: Response) => {
  try {
    const payouts = await Payout.find().sort({ createdAt: -1 });
    const enrichedPayouts = await Promise.all(payouts.map(async (payout) => {
      const user = await User.findOne({ id: payout.userId });
      return {
        ...payout.toObject(),
        userName: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : "Unknown User",
        bankDetails: user?.partnerProfile?.bankDetails || "N/A"
      };
    }));
    res.json(enrichedPayouts);
  } catch (error) {
    console.error("Error fetching payouts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePayoutStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, bankReferenceId, rejectionReason } = req.body;
    
    const payout = await Payout.findOneAndUpdate(
      { id },
      { status, bankReferenceId, rejectionReason, updatedAt: new Date().toISOString() },
      { new: true }
    );

    if (!payout) return res.status(404).json({ error: "Payout not found" });

    // Deduct from wallet balance if Paid
    if (status === "Paid" && payout.userId) {
      const user = await User.findOne({ id: payout.userId });
      if (user) {
        const currentBalance = user.partnerProfile?.walletBalance || 0;
        await User.findOneAndUpdate(
          { id: payout.userId },
          { "partnerProfile.walletBalance": currentBalance - payout.amount }
        );
      }
    }

    res.json({ success: true, payout });
  } catch (error) {
    console.error("Error updating Payout status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// User: Get my KYC
export const getMyKyc = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const kyc = await Kyc.findOne({ userId }).sort({ createdAt: -1 });
    res.json({ kyc: kyc || null });
  } catch (error) {
    console.error("Error fetching user KYC:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// User: Submit / Update KYC
export const submitKyc = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { panNumber, aadhaarNumber, bankAccount, ifscCode, upiId } = req.body;

    const existing = await Kyc.findOne({ userId });
    if (existing) {
      existing.panNumber = panNumber;
      existing.aadhaarNumber = aadhaarNumber;
      existing.bankAccount = bankAccount;
      existing.ifscCode = ifscCode;
      existing.upiId = upiId;
      (existing as any).status = "Pending";
      existing.updatedAt = new Date().toISOString();
      await existing.save();
      return res.json({ success: true, kyc: existing });
    }

    const kyc = new Kyc({
      id: `kyc_${Date.now()}`,
      userId,
      panNumber,
      aadhaarNumber,
      bankAccount,
      ifscCode,
      upiId,
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await kyc.save();
    await User.findOneAndUpdate({ id: userId }, { "partnerProfile.kycStatus": "Pending" });
    res.json({ success: true, kyc });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
