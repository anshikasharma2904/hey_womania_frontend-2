import mongoose from "mongoose";

const cancellationRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  orderNumber: String,
  userId: String,
  reason: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  createdAt: String,
  updatedAt: String,
}, { collection: "cancellationRequests" });

export const CancellationRequest = mongoose.model("CancellationRequest", cancellationRequestSchema);
