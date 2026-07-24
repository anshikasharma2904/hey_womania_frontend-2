import express from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/paymentController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(requireAuth);

router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);

export default router;
