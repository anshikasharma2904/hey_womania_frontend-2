import mongoose from "mongoose";

const shiprocketTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: "shiprocket_tokens" });

export const ShiprocketToken = mongoose.model("ShiprocketToken", shiprocketTokenSchema);
