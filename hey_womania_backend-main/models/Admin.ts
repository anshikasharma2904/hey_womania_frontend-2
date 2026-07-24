import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: String,
  role: { type: String, default: "superadmin" },
  createdAt: String,
  updatedAt: String,
}, { collection: "admins" });

export const Admin = mongoose.model("Admin", adminSchema);
