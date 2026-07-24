import mongoose from "mongoose";

const refundRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  orderNumber: String,
  userId: String,
  amount: Number,
  paymentMethod: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Processed"], default: "Pending" },
  createdAt: String,
  updatedAt: String,
}, { collection: "refundRequests" });

export const RefundRequest = mongoose.model("RefundRequest", refundRequestSchema);
