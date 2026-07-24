import { Request, Response } from "express";
import crypto from "crypto";
import { Category } from "../models/Category";
import { Product } from "../models/Product";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const totalItems = await Category.countDocuments();
    const categories = await Category.find().sort({ sortOrder: 1 }).skip(skip).limit(limit);
    
    // Enrich with product counts
    const enrichedCategories = await Promise.all(categories.map(async (category) => {
      const count = await Product.countDocuments({ category: category.name });
      return { ...category.toObject(), productsCount: count };
    }));

    res.json({
      data: enrichedCategories,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, isActive, sortOrder } = req.body;
    
    // Create a URL friendly slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: "A category with this name already exists" });
    }

    const now = new Date().toISOString();
    const newCategory = new Category({
      id: crypto.randomUUID(),
      name,
      slug,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
      createdAt: now,
      updatedAt: now
    });

    await newCategory.save();
    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date().toISOString();

    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const category = await Category.findOneAndUpdate({ id }, updates, { new: true });
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json({ success: true, category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({ id });
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
