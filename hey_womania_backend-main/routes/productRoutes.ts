import express from "express";
import {
  getBestSellerProducts,
  getProducts,
  getProductBySlug,
  getRelatedProducts
} from "../controllers/productController";

const router = express.Router();

// Public route to fetch products from the DB
router.get("/", getProducts);
router.get("/best-sellers", getBestSellerProducts);
router.get("/related", getRelatedProducts);
router.get("/:slug", getProductBySlug);

export default router;
