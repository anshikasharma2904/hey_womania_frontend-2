import { Request, Response } from "express";
import crypto from "crypto";
import { Product } from "../models/Product";
import { Setting } from "../models/Setting";

// Calculate sell points helper
const calculateSellPoints = async (salePrice: number, isEligible: boolean) => {
  if (!isEligible) return 0;
  try {
    const settings = await Setting.findOne();
    const divisor = settings?.sellPointDivisor || 5; // Default to 5 if settings missing
    return Number((salePrice / divisor).toFixed(2));
  } catch (err) {
    return Number((salePrice / 5).toFixed(2));
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const totalItems = await Product.countDocuments();
    const products = await Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    res.json({
      data: products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Create slug
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: "A product with this title already exists" });
    }

    // Dynamic Sell Points calculation
    const sellPoints = await calculateSellPoints(data.salePrice, data.isSellPointEligible);

    const now = new Date().toISOString();
    const newProduct = new Product({
      id: crypto.randomUUID(),
      ...data,
      slug,
      sellPoints,
      createdAt: now,
      updatedAt: now
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date().toISOString();

    if (updates.title) {
      updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Recalculate sell points if price or eligibility changed
    if (updates.salePrice !== undefined || updates.isSellPointEligible !== undefined) {
      const currentProduct = await Product.findOne({ id });
      if (currentProduct) {
        const salePrice = updates.salePrice !== undefined ? updates.salePrice : currentProduct.salePrice;
        const isEligible = updates.isSellPointEligible !== undefined ? updates.isSellPointEligible : currentProduct.isSellPointEligible;
        updates.sellPoints = await calculateSellPoints(salePrice, isEligible);
      }
    }

    const product = await Product.findOneAndUpdate({ id }, updates, { new: true });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ id });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
