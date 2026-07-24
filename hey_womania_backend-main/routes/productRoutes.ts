import express from "express";
import { getProducts, getProductBySlug } from "../controllers/productController";

const router = express.Router();

// Public route to fetch products from the DB
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

export default router;
