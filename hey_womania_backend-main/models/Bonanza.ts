import mongoose from "mongoose";

const bonanzaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  targetPersonalSp: { type: Number, default: 0 },
  targetTeamSp: { type: Number, default: 0 },
  rewardDescription: { type: String, required: true },
  status: { type: String, enum: ["Active", "Upcoming", "Expired"], default: "Upcoming" },
  createdAt: String,
  updatedAt: String,
}, { collection: "bonanzas" });

export const Bonanza = mongoose.model("Bonanza", bonanzaSchema);
