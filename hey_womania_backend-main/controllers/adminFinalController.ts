import { Request, Response } from "express";
import crypto from "crypto";
import { Bonanza } from "../models/Bonanza";
import { AuditLog } from "../models/AuditLog";

// Bonanzas
export const getBonanzas = async (req: Request, res: Response) => {
  try {
    const bonanzas = await Bonanza.find().sort({ createdAt: -1 });
    res.json(bonanzas);
  } catch (error) {
    console.error("Error fetching bonanzas:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createBonanza = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const now = new Date().toISOString();
    
    const newBonanza = new Bonanza({
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now
    });

    await newBonanza.save();
    
    // Log Audit
    await new AuditLog({
      id: crypto.randomUUID(),
      adminId: "admin-system",
      adminEmail: "admin@heywomania.com",
      action: "Created Bonanza",
      module: "Bonanza",
      details: `Created bonanza: ${data.title}`,
      createdAt: now
    }).save();

    res.status(201).json({ success: true, bonanza: newBonanza });
  } catch (error) {
    console.error("Error creating bonanza:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Audit Logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Log generic actions middleware/util (Internal only)
export const logAdminAction = async (adminId: string, adminEmail: string, action: string, module: string, details: string) => {
  try {
    await new AuditLog({
      id: crypto.randomUUID(),
      adminId,
      adminEmail,
      action,
      module,
      details,
      createdAt: new Date().toISOString()
    }).save();
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};
