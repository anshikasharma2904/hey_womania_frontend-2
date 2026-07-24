import { Request, Response } from "express";
import { Setting } from "../models/Setting";

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Setting.findOne();
    
    // If no settings exist yet, create default settings
    if (!settings) {
      settings = await Setting.create({ updatedAt: new Date().toISOString() });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = await Setting.create({ ...updates, updatedAt: new Date().toISOString() });
    } else {
      settings = await Setting.findOneAndUpdate({}, { ...updates, updatedAt: new Date().toISOString() }, { new: true });
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
