import mongoose from "mongoose";

const scoreProgressSchema = new mongoose.Schema(
  {
    target: Number,
    current: Number,
    achieved: { type: Boolean, default: false }
  },
  { _id: false }
);

const partnerDashboardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    totalOrders: { type: Number, default: 0 },
    totalReferrals: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    rank: { type: String, default: "Starter" },
    sellPriceTotal: { type: Number, default: 0 },
    sellPointsTotal: { type: Number, default: 0 },
    activeDirects: { type: Number, default: 0 },
    selfSellIncome: { type: Number, default: 0 },
    fastTrackIncome: { type: Number, default: 0 },
    scoreIncome: { type: Number, default: 0 },
    dreamCarFundIncome: { type: Number, default: 0 },
    dreamHouseFundIncome: { type: Number, default: 0 },
    partnershipBonusIncome: { type: Number, default: 0 },
    smartSellerPoolIncome: { type: Number, default: 0 },
    annualClubIncome: { type: Number, default: 0 },
    timelyRewardsIncome: { type: Number, default: 0 },
    kycVerified: { type: Boolean, default: false },
    nomineeDetails: {
      nomineeName: { type: String, default: "" },
      nomineeRelation: { type: String, default: "" },
      nomineeAge: { type: String, default: "" },
      nomineeDob: { type: String, default: "" }
    },
    scoreProgress: {
      glam: { type: scoreProgressSchema, default: () => ({ target: 2500, current: 0, achieved: false }) },
      style: { type: scoreProgressSchema, default: () => ({ target: 25000, current: 0, achieved: false }) },
      gorgeous: { type: scoreProgressSchema, default: () => ({ target: 100000, current: 0, achieved: false }) },
      superWomenia: { type: scoreProgressSchema, default: () => ({ target: 2, current: 0, achieved: false }) }
    },
    clubProgress: {
      superClub: { type: scoreProgressSchema, default: () => ({ target: 5000000, current: 0, achieved: false }) },
      megaClub: { type: scoreProgressSchema, default: () => ({ target: 20000000, current: 0, achieved: false }) },
      luxuryLifeClub: { type: scoreProgressSchema, default: () => ({ target: 50000000, current: 0, achieved: false }) }
    },
    createdAt: String,
    updatedAt: String
  },
  { collection: "partner_dashboards" }
);

export const PartnerDashboard =
  mongoose.models.PartnerDashboard || mongoose.model("PartnerDashboard", partnerDashboardSchema);
