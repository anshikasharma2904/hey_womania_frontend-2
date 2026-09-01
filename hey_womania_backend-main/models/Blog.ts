import mongoose from "mongoose";

export interface IBlog extends mongoose.Document {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  status: "Draft" | "Published";
  createdAt: string;
  updatedAt: string;
}

const blogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  author: { type: String, required: true, default: "Admin" },
  status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
  createdAt: { type: String },
  updatedAt: { type: String }
});

export const Blog = mongoose.model<IBlog>("Blog", blogSchema);
