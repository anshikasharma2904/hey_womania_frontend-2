import mongoose from "mongoose";

const inventoryLedgerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  sku: { type: String, required: true },
  orderId: { type: String }, // Optional, for order-related movements
  type: { 
    type: String, 
    enum: [
      "Reservation", 
      "Dispatch", 
      "Cancellation_Release", 
      "Payment_Failed_Release", 
      "Return", 
      "Admin_Adjustment"
    ],
    required: true
  },
  qtyChanged: { type: Number, required: true },
  remarks: { type: String },
  createdAt: { type: String, required: true },
}, { collection: "inventoryLedgers" });

export const InventoryLedger = mongoose.model("InventoryLedger", inventoryLedgerSchema);
