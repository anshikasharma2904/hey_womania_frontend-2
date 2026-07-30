import express from "express";
import { getCategories } from "../controllers/categoryController";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";

const router = express.Router();

// Public route to fetch categories from the DB with 60-second caching
router.get("/", cacheMiddleware(60), getCategories);

export default router;
