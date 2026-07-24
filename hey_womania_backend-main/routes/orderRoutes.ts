import express from "express";
import { getUserOrders, getOrderById, createOrder } from "../controllers/orderController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(requireAuth);

router.get("/", getUserOrders);
router.post("/", createOrder);
router.get("/:id", getOrderById);

export default router;
