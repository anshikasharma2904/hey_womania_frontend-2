import { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/User";
import { Admin } from "../models/Admin";
import { createSessionToken, hashPassword, verifyPassword } from "../utils/authHelpers";

const SESSION_COOKIE_NAME = "hey_womania_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 60;

function createReferralCode(firstName: string) {
  const prefix = firstName.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "HEY";
  return `${prefix}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, role, ref, refType } = req.body;
    
    // Validate refType restriction
    if (ref && refType) {
      if (refType === 'customer' && role === 'partner') {
        return res.status(400).json({ error: "This link is for customer registration only." });
      }
      if (refType === 'partner' && role === 'member') {
        return res.status(400).json({ error: "This link is for partner registration only." });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "An account already exists with this email." });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const newUser = new User({
      id: crypto.randomUUID(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: role || "member",
      verified: false,
      rank: role === "partner" ? "Starter" : "",
      referralCode: createReferralCode(firstName),
      partnerReferralCode: role === "partner" ? `HW-${crypto.randomBytes(3).toString("hex").toUpperCase()}` : undefined,
      teamIds: [],
      joinedViaRefType: (ref && refType) ? refType : undefined,
      createdAt: now,
      updatedAt: now,
      partnerProfile: {
        walletBalance: 100,
        networkWalletBalance: 0
      }
    });

    let sponsorToUpdate = null;

    if (ref) {
      const sponsorRef = ref.toString().toUpperCase().trim();
      const sponsor = await User.findOne({ 
        $or: [{ referralCode: sponsorRef }, { partnerReferralCode: sponsorRef }] 
      });

      if (!sponsor) {
        return res.status(400).json({ error: "Invalid referral code." });
      }

      const userRole = role || "member";
      if (userRole === "member" && sponsor.partnerReferralCode === sponsorRef) {
        return res.status(400).json({ error: "This referral code is for partner registration only." });
      }
      if (userRole === "partner" && sponsor.referralCode === sponsorRef) {
        return res.status(400).json({ error: "This referral code is for customer registration only." });
      }

      newUser.uplineId = sponsor.id;
      newUser.ancestors = [...(sponsor.ancestors || []), sponsor.id];
      // Manually entered codes do not include a URL refType. Infer the
      // relationship from the chosen account role after the code is validated.
      newUser.joinedViaRefType = refType === "customer" || refType === "partner"
        ? refType
        : (userRole === "partner" ? "partner" : "customer");
      sponsorToUpdate = sponsor;
    }

    await newUser.save();

    if (sponsorToUpdate) {
      if (!sponsorToUpdate.teamIds) {
        sponsorToUpdate.teamIds = [];
      }
      sponsorToUpdate.teamIds.push(newUser.id);
      await sponsorToUpdate.save();
    }

    const token = createSessionToken({ id: newUser.id, role: newUser.role as string });
    
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_SECONDS * 1000,
      path: "/",
      sameSite: "lax"
    });

    res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createSessionToken({ id: user.id, role: user.role as string });
    
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_SECONDS * 1000,
      path: "/",
      sameSite: "lax"
    });

    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (!admin || !admin.passwordHash) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const token = createSessionToken({ id: admin.id, role: admin.role as string });
    
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_SECONDS * 1000,
      path: "/",
      sameSite: "lax"
    });

    res.json({ success: true, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.json({ success: true });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // Don't leak if user exists or not, just return success
      return res.json({ success: true, message: "If the email exists, an OTP was sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    // Configure Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = require("nodemailer").createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Hey Womania" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Your Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #9c4049;">Password Reset Request</h2>
            <p>You requested to reset your password. Here is your 6-digit OTP:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #5f5d3e;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.log(`\n\n========== OTP EMAIL SENT ==========`);
      console.log(`To: ${user.email}`);
      console.log(`Subject: Password Reset OTP`);
      console.log(`Your OTP is: ${otp}`);
      console.log(`[Note: Nodemailer requires EMAIL_USER and EMAIL_PASS in .env]`);
      console.log(`====================================\n\n`);
    }

    res.json({ success: true, message: "If the email exists, an OTP was sent." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      resetOtp: otp,
      resetOtpExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      resetOtp: otp,
      resetOtpExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    user.passwordHash = await hashPassword(newPassword);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
