import mongoose from "mongoose";

const salesMonthCloseSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ["Locked"], default: "Locked" },
  deliveredOrderCount: { type: Number, default: 0 },
  lockedAt: { type: String, required: true }
}, { collection: "salesMonthCloses" });

export const SalesMonthClose = mongoose.models.SalesMonthClose ||
  mongoose.model("SalesMonthClose", salesMonthCloseSchema);

