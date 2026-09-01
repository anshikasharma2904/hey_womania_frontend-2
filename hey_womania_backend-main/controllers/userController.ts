import { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/User";

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = await User.findOne({ id: userId }).select("-passwordHash").lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.uplineId) {
      const uplineUser = await User.findOne({ id: user.uplineId }).select("firstName lastName");
      if (uplineUser) {
        (user as any).uplineName = `${uplineUser.firstName || ""} ${uplineUser.lastName || ""}`.trim();
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const data = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "Not found" });

    if (data.firstName !== undefined) user.firstName = data.firstName.trim();
    if (data.lastName !== undefined) user.lastName = data.lastName.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim();
    
    if (data.firstName || data.lastName) {
      user.name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    user.updatedAt = new Date().toISOString();

    await user.save();
    
    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addUserAddress = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const address = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "Not found" });

    if (address.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    user.addresses.push({
      ...address,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    });
    user.updatedAt = new Date().toISOString();

    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeUserAddress = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { addressId } = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "Not found" });

    user.addresses = user.addresses.filter(a => a.id !== addressId) as any;
    user.updatedAt = new Date().toISOString();

    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addUserPaymentMethod = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const payment = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "Not found" });

    if (payment.isDefault) {
      user.paymentMethods.forEach(p => { p.isDefault = false; });
    }

    user.paymentMethods.push({
      ...payment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    });
    user.updatedAt = new Date().toISOString();

    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeUserPaymentMethod = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { paymentId } = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "Not found" });

    user.paymentMethods = user.paymentMethods.filter(p => p.id !== paymentId) as any;
    user.updatedAt = new Date().toISOString();

    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const upgradeToPartner = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { sponsorCode } = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "Not found" });

    if (user.role === "partner") {
      return res.status(400).json({ error: "User is already a partner." });
    }

    if (sponsorCode && !user.uplineId) {
      const sponsorRef = sponsorCode.toString().toUpperCase().trim();
      const sponsor = await User.findOne({ 
        $or: [{ referralCode: sponsorRef }, { partnerReferralCode: sponsorRef }] 
      });
      if (!sponsor) {
        return res.status(400).json({ error: "Invalid sponsor code." });
      }
      if (sponsor.id === user.id) {
        return res.status(400).json({ error: "You cannot sponsor yourself." });
      }
      
      // Enforce partner-level sponsor code for partner upgrades
      if (sponsor.referralCode === sponsorRef && sponsor.partnerReferralCode !== sponsorRef) {
        return res.status(400).json({ error: "You must use a Partner Sponsor Code to join the partner program." });
      }

      // Prevent circular loops in the network tree
      if (sponsor.ancestors && sponsor.ancestors.includes(user.id)) {
        return res.status(400).json({ error: "You cannot use a sponsor who is already in your downline." });
      }
      
      user.uplineId = sponsor.id;
      user.ancestors = [...(sponsor.ancestors || []), sponsor.id];
      
      if (!sponsor.teamIds) {
        sponsor.teamIds = [];
      }
      sponsor.teamIds.push(user.id);
      await sponsor.save();
    }

    user.role = "partner";
    user.rank = "Starter";
    
    if (!user.partnerReferralCode) {
      const crypto = await import("crypto");
      user.partnerReferralCode = `HW-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    }

    if (!user.partnerProfile) {
      user.partnerProfile = {
        walletBalance: 100, // Matches initial bonus
        networkWalletBalance: 0
      };
    }
    
    user.updatedAt = new Date().toISOString();
    await user.save();
    
    // We update the session cookie because the role has changed.
    const { createSessionToken } = await import("../utils/authHelpers");
    const token = createSessionToken({ id: user.id, role: user.role as string });
    
    res.cookie("hey_womania_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 60 * 1000,
      path: "/",
      sameSite: "lax"
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.json({ success: true, user: userObj });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
