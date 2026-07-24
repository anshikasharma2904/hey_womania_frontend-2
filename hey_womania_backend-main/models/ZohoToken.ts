import mongoose from "mongoose";

const zohoTokenSchema = new mongoose.Schema(
  {
    accessToken: String,
    refreshToken: String,
    apiDomain: String,
    expiresAt: Date
  },
  { timestamps: true, collection: "zoho_tokens" }
);

export const ZohoToken = mongoose.model("ZohoToken", zohoTokenSchema);
