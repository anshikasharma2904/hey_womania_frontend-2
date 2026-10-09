import express from "express";
import {
  getBestSellerProducts,
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  checkStock,
  submitFeedback
} from "../controllers/productController";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";
import { optionalAuth } from "../middlewares/authMiddleware";

const router = express.Router();

// Public route to fetch products from the DB with 60-second caching
router.get("/", cacheMiddleware(60), getProducts);
router.get("/best-sellers", cacheMiddleware(60), getBestSellerProducts);
router.get("/related", cacheMiddleware(60), getRelatedProducts);
router.post("/check-stock", checkStock);
router.post("/feedback", optionalAuth, submitFeedback);
router.get("/:slug", cacheMiddleware(60), getProductBySlug);

export default router;
