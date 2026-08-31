import mongoose from "mongoose";

const sellPointLedgerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  orderId: { type: String, required: true },
  salesMonth: { type: String, index: true },
  productId: String,
  sellPrice: Number,
  sellPoints: { type: Number, required: true },
  type: { type: String, enum: ["Credit", "Debit", "Reversal"], required: true },
  status: { type: String, enum: ["pending", "approved", "reversed"], default: "pending" },
  remarks: String,
  createdAt: String,
  updatedAt: String,
}, { collection: "sellPointLedgers" });

export const SellPointLedger = mongoose.model("SellPointLedger", sellPointLedgerSchema);
