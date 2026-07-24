import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  orderNumber: String,
  userId: String,
  reason: String,
  images: [String],
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  createdAt: String,
  updatedAt: String,
}, { collection: "returnRequests" });

export const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
