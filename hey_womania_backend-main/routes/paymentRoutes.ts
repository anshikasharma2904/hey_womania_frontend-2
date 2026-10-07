import express from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/paymentController";
import { optionalAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(optionalAuth);

router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);

export default router;
