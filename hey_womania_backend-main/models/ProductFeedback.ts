import mongoose from "mongoose";

const productFeedbackSchema = new mongoose.Schema({
  productSku: { type: String, required: true },
  productId: { type: String, required: true },
  productTitle: { type: String },
  userId: { type: String }, // Optional, id or ObjectId depending on how users are stored
  userEmail: { type: String },
  userName: { type: String },
  rating: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { collection: "productFeedback" });

export const ProductFeedback = mongoose.model("ProductFeedback", productFeedbackSchema);
