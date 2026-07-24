import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  adminId: { type: String, required: true },
  adminEmail: { type: String, required: true },
  action: { type: String, required: true }, // e.g., "Updated Setting", "Approved KYC", "Executed Closing"
  module: { type: String, required: true }, // e.g., "Settings", "Payouts", "Monthly Closing"
  details: String, // JSON stringified details
  ipAddress: String,
  createdAt: String,
}, { collection: "auditLogs" });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
