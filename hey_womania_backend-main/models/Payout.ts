import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  amount: { type: Number, required: true },
  sellPointsBasis: { type: Number, required: true },
  activeDirectsBasis: { type: Number, required: true },
  kycVerified: { type: Boolean, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Paid", "Failed"], default: "Pending" },
  bankReferenceId: String,
  rejectionReason: String,
  createdAt: String,
  updatedAt: String,
}, { collection: "payouts" });

export const Payout = mongoose.model("Payout", payoutSchema);
