import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  aadhaarNumber: String,
  secondaryDocumentType: { type: String, enum: ["Voter ID", "Driving License", "Other"] },
  secondaryDocumentNumber: String,
  verificationProviderId: String,
  bankAccount: String,
  ifscCode: String,
  upiId: String,
  documentUrls: [String],
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  rejectionReason: String,
  createdAt: String,
  updatedAt: String,
}, { collection: "kycs" });

export const Kyc = mongoose.model("Kyc", kycSchema);
