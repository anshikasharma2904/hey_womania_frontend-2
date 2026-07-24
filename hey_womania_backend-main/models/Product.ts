import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  availableStock: { type: Number, default: 0 },
  reservedStock: { type: Number, default: 0 },
  returnStock: { type: Number, default: 0 },
  damagedStock: { type: Number, default: 0 },
  zohoItemId: String,
  zohoLastSyncedAt: String,
  zohoSyncStatus: String,
  zohoSyncError: String
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  images: [String],
  price: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  variants: [variantSchema],
  category: { type: String, required: true },
  isReturnable: { type: Boolean, default: true },
  isCodAllowed: { type: Boolean, default: true },
  isSellPointEligible: { type: Boolean, default: true },
  sellPoints: { type: Number, default: 0 }, // Calculated dynamically
  isActive: { type: Boolean, default: true },
  zohoItemId: String,
  zohoSku: String,
  zohoLastSyncedAt: String,
  zohoSyncStatus: String,
  zohoSyncError: String,
  createdAt: String,
  updatedAt: String,
}, { collection: "products" });

export const Product = mongoose.model("Product", productSchema);
