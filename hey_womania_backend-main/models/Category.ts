import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: String,
  updatedAt: String,
}, { collection: "categories" });

export const Category = mongoose.model("Category", categorySchema);
