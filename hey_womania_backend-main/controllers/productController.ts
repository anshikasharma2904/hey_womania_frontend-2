import { Request, Response } from "express";
import crypto from "crypto";
import { Product } from "../models/Product";
import { Setting } from "../models/Setting";
import { Order } from "../models/Order";
import { invalidateBackendCache } from "../middlewares/cacheMiddleware";
import { processProductImagesForCloudflare } from "../services/cloudflareImageService";

// Calculate sell points helper: Selling Price / 5 = Sell Points
const calculateSellPoints = (salePrice: number) => {
  const price = Number(salePrice) || 0;
  return Number((price / 5).toFixed(2));
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
    const cleanSlug = decodeURIComponent(slug || "").trim();

    if (!cleanSlug) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 1. Try exact slug match
    let product = await Product.findOne({ slug: cleanSlug });

    // 2. Try id, zohoGroupId, or zohoItemId match
    if (!product) {
      product = await Product.findOne({
        $or: [
          { id: cleanSlug },
          { zohoGroupId: cleanSlug },
          { zohoItemId: cleanSlug }
        ]
      });
    }

    // 3. Try case-insensitive slug or title regex match
    if (!product) {
      const sanitized = cleanSlug.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const normalizedWords = cleanSlug.split(/[-_\s]+/).filter((w) => w.length > 2);
      
      const regexConditions: any[] = [
        { slug: new RegExp(`^${sanitized}$`, "i") },
        { title: new RegExp(`^${sanitized.replace(/\\-/g, "[\\s\\-]")}`, "i") }
      ];

      if (normalizedWords.length > 0) {
        const firstTwoWords = normalizedWords.slice(0, 2).join(".*");
        regexConditions.push({ title: new RegExp(firstTwoWords, "i") });
        regexConditions.push({ slug: new RegExp(firstTwoWords, "i") });
      }

      product = await Product.findOne({ $or: regexConditions });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRelatedProducts = async (req: Request, res: Response) => {
  try {
    const category = String(req.query.category || "").trim();
    const excludeSlug = String(req.query.excludeSlug || "").trim();
    const limit = Math.max(1, Math.min(parseInt(String(req.query.limit || "4"), 10) || 4, 12));

    if (!category) {
      return res.status(400).json({ error: "category is required" });
    }

    const normalizedCategory = category.toLowerCase();
    const normalizedCategoryNoSpaces = normalizedCategory.replace(/\s+/g, "");
    const normalizedCategorySlug = normalizedCategory.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const products = await Product.find({
      slug: excludeSlug ? { $ne: excludeSlug } : { $exists: true },
      isActive: { $ne: false }
    }).sort({ createdAt: -1 });

    const relatedProducts = products
      .filter((product) => {
        const rawCategory = String(product.category || "");
        const parts = rawCategory
          .split("/")
          .map((part) => part.trim())
          .filter(Boolean);

        const normalizedParts = parts.map((part) => part.toLowerCase());
        const normalizedPartSlugs = normalizedParts.map((part) =>
          part.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
        );
        const normalizedPartNoSpaces = normalizedParts.map((part) => part.replace(/\s+/g, ""));

        return (
          normalizedParts.includes(normalizedCategory) ||
          normalizedPartNoSpaces.includes(normalizedCategoryNoSpaces) ||
          normalizedPartSlugs.includes(normalizedCategorySlug)
        );
      })
      .slice(0, limit);

    return res.json({
      data: relatedProducts,
      meta: {
        category,
        excludeSlug,
        total: relatedProducts.length
      }
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getBestSellerProducts = async (req: Request, res: Response) => {
  try {
    const limit = Math.max(1, Math.min(parseInt(String(req.query.limit || "7"), 10) || 7, 20));

    const blockedStatuses = ["Cancelled", "Returned", "Refunded"];
    const orders = await Order.find({
      status: { $nin: blockedStatuses }
    }).sort({ createdAt: -1 });

    const quantityByProductId = new Map<string, number>();

    for (const order of orders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const productId = String(item?.productId || "").trim();
        const qty = Number(item?.qty || 0) || 0;

        if (!productId || qty <= 0) continue;

        quantityByProductId.set(productId, (quantityByProductId.get(productId) || 0) + qty);
      }
    }

    const rankedProductIds = Array.from(quantityByProductId.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => productId);

    const products = await Product.find({
      isActive: { $ne: false }
    });

    const rankedProducts = products.filter((product) =>
      rankedProductIds.includes(String(product.id))
    );

    const productMap = new Map(rankedProducts.map((product) => [String(product.id), product]));

    const bestSellers = rankedProductIds
      .map((productId) => {
        const product = productMap.get(productId);
        if (!product) return null;

        return {
          ...product.toObject(),
          soldCount: quantityByProductId.get(productId) || 0
        };
      })
      .filter(Boolean);

    const remainingSlots = Math.max(0, limit - bestSellers.length);

    if (remainingSlots > 0) {
      const selectedIds = new Set(bestSellers.map((product: any) => String(product.id)));
      const randomPool = products.filter((product) => !selectedIds.has(String(product.id)));

      const shuffledPool = [...randomPool].sort(() => Math.random() - 0.5);
      const fillerProducts = shuffledPool.slice(0, remainingSlots).map((product) => ({
        ...product.toObject(),
        soldCount: 0
      }));

      return res.json({
        data: [...bestSellers, ...fillerProducts],
        meta: {
          limit,
          source: bestSellers.length > 0 ? "orders+random" : "random",
          rankedCount: bestSellers.length,
          fillerCount: fillerProducts.length
        }
      });
    }

    return res.json({
      data: bestSellers.slice(0, limit),
      meta: {
        limit,
        source: "orders",
        rankedCount: bestSellers.length,
        fillerCount: 0
      }
    });
  } catch (error) {
    console.error("Error fetching best seller products:", error);
    return res.status(500).json({ error: "Internal server error" });
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

    // Dynamic Sell Points calculation: Selling Price / 5 = Sell Points
    const sellPoints = calculateSellPoints(data.salePrice);

    // Process images for Cloudflare
    const { images, cloudflareImageIds } = await processProductImagesForCloudflare(data.images || [], data.title);

    const now = new Date().toISOString();
    const newProduct = new Product({
      id: crypto.randomUUID(),
      ...data,
      images,
      cloudflareImageIds,
      slug,
      sellPoints,
      createdAt: now,
      updatedAt: now
    });

    await newProduct.save();
    invalidateBackendCache("/api/products");
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

    // Recalculate sell points if sale price updated: Selling Price / 5 = Sell Points
    if (updates.salePrice !== undefined) {
      updates.sellPoints = calculateSellPoints(updates.salePrice);
    }

    // Process images for Cloudflare if updated
    if (Array.isArray(updates.images)) {
      const { images, cloudflareImageIds } = await processProductImagesForCloudflare(updates.images, updates.title || id);
      updates.images = images;
      updates.cloudflareImageIds = cloudflareImageIds;
    }

    const product = await Product.findOneAndUpdate({ id }, updates, { new: true });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    invalidateBackendCache("/api/products");
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
    
    invalidateBackendCache("/api/products");
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
