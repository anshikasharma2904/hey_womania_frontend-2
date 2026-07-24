import { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/User";

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = await User.findOne({ id: userId }).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
