import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  sellPointDivisor: { type: Number, default: 5 },
  minPayoutSellPoints: { type: Number, default: 500 },
  minActiveDirects: { type: Number, default: 2 },
  supportEmail: { type: String, default: "support@heywomania.com" },
  supportPhone: { type: String, default: "1800-123-4567" },
  businessAddress: { type: String, default: "123 Fashion Street, New Delhi" },
  returnWindowDays: { type: Number, default: 7 },
  refundTimeline: { type: String, default: "7-10 business days" },
  
  // Reward Settings (MLM Engine)
  selfSellPercentage: { type: Number, default: 10 },
  fastTrackL1: { type: Number, default: 5 },
  fastTrackL2: { type: Number, default: 3 },
  fastTrackL3: { type: Number, default: 2 },
  glamTarget: { type: Number, default: 2500 },
  styleTarget: { type: Number, default: 25000 },
  gorgeousTarget: { type: Number, default: 100000 },
  dreamCarTarget: { type: Number, default: 100000 },
  dreamCarMonths: { type: Number, default: 3 },
  dreamHouseTarget: { type: Number, default: 200000 },
  dreamHouseMonths: { type: Number, default: 3 },
  smartSellerTarget: { type: Number, default: 10000 },
  smartSellerMonths: { type: Number, default: 3 },

  // Site Config (Layout)
  heroVideoDesktop: { type: String, default: "https://www.youtube.com/watch?v=fAdYAOFqIC4" },
  heroVideoMobile: { type: String, default: "/phoneVideo.mp4" },
  categoryImages: { type: mongoose.Schema.Types.Mixed, default: {} },

  updatedAt: String,
}, { collection: "settings" });

export const Setting = mongoose.model("Setting", settingSchema);
