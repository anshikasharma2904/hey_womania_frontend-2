import mongoose from "mongoose";

const incomeLedgerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  incomeType: { 
    type: String, 
    enum: [
      "Self Sell Income", "Fast Track Income", "Glam Score", 
      "Style Score", "Gorgeous Score", "Super Womania Score", 
      "Dream Car Fund", "Dream House Fund", "Partnership Bonus", 
      "Smart Seller Pool", "Annual Club", "Bonanza"
    ], 
    required: true 
  },
  amount: { type: Number, required: true },
  sellPointsBasis: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "approved", "paid"], default: "pending" },
  remarks: String,
  createdAt: String,
  updatedAt: String,
}, { collection: "incomeLedgers" });

export const IncomeLedger = mongoose.model("IncomeLedger", incomeLedgerSchema);
