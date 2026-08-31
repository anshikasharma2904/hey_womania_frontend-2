import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
  source: { 
    type: String, 
    enum: [
      "Affiliate Link", 
      "Womaniyaa Point", 
      "Super Womaniyaa Point", 
      "Network Income", 
      "Withdrawal", 
      "Order Purchase",
      "Other"
    ], 
    required: true 
  },
  description: { type: String, required: true },
  orderId: String,
  referralCustomerId: String,
  commissionMonth: String,
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
}, { collection: "walletTransactions" });

walletTransactionSchema.index(
  { source: 1, type: 1, orderId: 1 },
  {
    unique: true,
    partialFilterExpression: { source: "Affiliate Link", orderId: { $type: "string" } }
  }
);

export const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);
