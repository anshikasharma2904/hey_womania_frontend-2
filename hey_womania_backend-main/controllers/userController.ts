import { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/User";
import { Admin } from "../models/Admin";
import { Order } from "../models/Order";

// Any user/partner who has no upline is placed directly under this
// root account in the MLM tree.
const DEFAULT_UPLINE_ID = "ac0b7976-613b-4b8a-8cf6-ead6b1bcde55";

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    let user: any = await User.findOne({ id: userId }).select("-passwordHash").lean();
    
    // If not found in User, check Admin collection
    if (!user) {
      user = await Admin.findOne({ id: userId }).select("-passwordHash").lean();
    }
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.uplineId) {
      const uplineUser = await User.findOne({ id: user.uplineId }).select("firstName lastName");
      if (uplineUser) {
        user.uplineName = `${uplineUser.firstName || ""} ${uplineUser.lastName || ""}`.trim();
      }
    }

    // Check if user has past orders (including cancelled ones)
    const pastOrderCount = await Order.countDocuments({
      userId: userId
    });
    user.hasPastOrders = pastOrderCount > 0;

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

    // If the user has no upline at all (no ref code + no sponsor entered),
    // assign the default root upline so they land in the MLM tree.
    if (!user.uplineId) {
      const defaultUpline = await User.findOne({ id: DEFAULT_UPLINE_ID });
      if (defaultUpline && defaultUpline.id !== user.id) {
        user.uplineId = defaultUpline.id;
        user.ancestors = [...(defaultUpline.ancestors || []), defaultUpline.id];
        if (!defaultUpline.teamIds) defaultUpline.teamIds = [];
        defaultUpline.teamIds.push(user.id);
        await defaultUpline.save();
      }
    }
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

export const addWalletBalance = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Please log in to add wallet balance." });
    }

    const { amount, paymentId } = req.body;
    const addAmount = Number(amount);
    if (!addAmount || addAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount. Must be greater than 0." });
    }

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.partnerProfile) {
      user.partnerProfile = {};
    }
    const currentBalance = Number(user.partnerProfile.walletBalance || 0);
    user.partnerProfile.walletBalance = currentBalance + addAmount;
    user.markModified("partnerProfile");
    user.updatedAt = new Date().toISOString();
    await user.save();

    const { WalletTransaction } = await import("../models/WalletTransaction");
    await WalletTransaction.create({
      id: crypto.randomUUID(),
      userId,
      amount: addAmount,
      type: "CREDIT",
      source: "Other",
      description: `Added ₹${addAmount} to shopping wallet ${paymentId ? `(Ref: ${paymentId})` : ""}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      walletBalance: user.partnerProfile.walletBalance,
      message: `₹${addAmount.toLocaleString("en-IN")} added successfully to your shopping wallet!`
    });
  } catch (error) {
    console.error("Add wallet balance error:", error);
    return res.status(500).json({ error: "Failed to add wallet balance." });
  }
};

export async function findOrCreateUserFromShipping(address: any, session?: any) {
  if (!address || !address.phone) return null;

  const rawPhone = String(address.phone || "").trim().replace(/[^0-9]/g, "");
  const normalizedPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;

  if (!normalizedPhone || normalizedPhone.length < 10) return null;

  let user = await User.findOne({
    $or: [{ phone: normalizedPhone }, { phone: `+91${normalizedPhone}` }, { phone: address.phone }]
  }).session(session || null);

  const fullName = String(address.fullName || address.name || "").trim();
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "";
  const now = new Date().toISOString();

  const userAddressObj = {
    id: crypto.randomUUID(),
    fullName: fullName || "Valued Customer",
    phone: normalizedPhone,
    streetAddress: address.streetAddress || address.street || "",
    streetAddressLine2: address.streetAddressLine2 || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    isDefault: true,
    createdAt: now
  };

  if (!user) {
    const { hashPassword } = await import("../utils/authHelpers");
    // Generate secure default customer password from phone
    const defaultPassword = `HW@${normalizedPhone.slice(-4)}${crypto.randomBytes(2).toString("hex")}`;
    const passwordHash = await hashPassword(defaultPassword);

    const prefix = firstName.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "HEY";
    const referralCode = `${prefix}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    user = new User({
      id: crypto.randomUUID(),
      firstName,
      lastName,
      name: fullName || `${firstName} ${lastName}`.trim(),
      email: address.email ? String(address.email).toLowerCase().trim() : undefined,
      phone: normalizedPhone,
      passwordHash,
      plainPassword: defaultPassword,
      role: "member",
      verified: true,
      rank: "",
      referralCode,
      teamIds: [],
      address: {
        streetAddress: userAddressObj.streetAddress,
        streetAddressLine2: userAddressObj.streetAddressLine2,
        city: userAddressObj.city,
        state: userAddressObj.state,
        pincode: userAddressObj.pincode
      },
      addresses: [userAddressObj],
      createdAt: now,
      updatedAt: now,
      partnerProfile: {
        walletBalance: 100,
        networkWalletBalance: 0
      }
    });

    const defaultUpline = await User.findOne({ id: DEFAULT_UPLINE_ID }).session(session || null);
    if (defaultUpline && defaultUpline.id !== user.id) {
      user.uplineId = defaultUpline.id;
      user.ancestors = [...(defaultUpline.ancestors || []), defaultUpline.id];
      if (!defaultUpline.teamIds) defaultUpline.teamIds = [];
      defaultUpline.teamIds.push(user.id);
      await defaultUpline.save({ session: session || undefined });
    }

    await user.save({ session: session || undefined });
  } else {
    if (!user.addresses) {
      (user as any).addresses = [];
    }

    const hasMatchingAddress = user.addresses.some(
      (a: any) =>
        a.pincode === userAddressObj.pincode &&
        (a.streetAddress || "").toLowerCase().trim() === (userAddressObj.streetAddress || "").toLowerCase().trim()
    );

    if (!hasMatchingAddress) {
      user.addresses.push(userAddressObj as any);
      user.address = {
        streetAddress: userAddressObj.streetAddress,
        streetAddressLine2: userAddressObj.streetAddressLine2,
        city: userAddressObj.city,
        state: userAddressObj.state,
        pincode: userAddressObj.pincode
      };
      user.updatedAt = now;
      await user.save({ session: session || undefined });
    }
  }

  return user;
}
