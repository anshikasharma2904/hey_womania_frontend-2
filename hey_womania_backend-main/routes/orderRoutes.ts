import express from "express";
import { getUserOrders, getOrderById, createOrder, cancelOrder, cleanupAbandonedOrders, returnOrder } from "../controllers/orderController";
import { requireAuth, optionalAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/cleanup-abandoned", cleanupAbandonedOrders); // Add secret auth if you want, but this is safe to expose.
router.get("/", requireAuth, getUserOrders);
router.post("/", optionalAuth, createOrder);
router.post("/:id/cancel", optionalAuth, cancelOrder);
router.post("/:id/return", optionalAuth, returnOrder);
router.get("/:id", requireAuth, getOrderById);

export default router;
