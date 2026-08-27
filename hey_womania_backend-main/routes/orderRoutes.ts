import express from "express";
import { getUserOrders, getOrderById, createOrder, cancelOrder } from "../controllers/orderController";
import { requireAuth, optionalAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", requireAuth, getUserOrders);
router.post("/", optionalAuth, createOrder);
router.post("/:id/cancel", optionalAuth, cancelOrder);
router.get("/:id", requireAuth, getOrderById);

export default router;
