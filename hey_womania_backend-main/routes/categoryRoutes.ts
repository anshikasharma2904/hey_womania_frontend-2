import express from "express";
import { getCategories } from "../controllers/categoryController";

const router = express.Router();

// Public route to fetch categories from the DB
router.get("/", getCategories);

export default router;
