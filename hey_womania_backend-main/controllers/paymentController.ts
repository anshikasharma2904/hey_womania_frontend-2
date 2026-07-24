import { Request, Response } from "express";
import crypto from "crypto";
import { createOrder } from "./orderController";

const RAZORPAY_API_URL = "https://api.razorpay.com/v1/orders";

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
}

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const credentials = getRazorpayCredentials();

    if (!credentials) {
      return res.status(500).json({ error: "Razorpay is not configured" });
    }

    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    const razorpayResponse = await fetch(RAZORPAY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `hey_womania_${Date.now()}`
      })
    });

    const data = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      return res.status(razorpayResponse.status).json({
        error: data?.error?.description || "Unable to create Razorpay order"
      });
    }

    return res.json({
      key: credentials.keyId,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const credentials = getRazorpayCredentials();

    if (!credentials) {
      return res.status(500).json({ error: "Razorpay is not configured" });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderPayload) {
      return res.status(400).json({ error: "Missing payment verification details" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", credentials.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(String(razorpay_signature));

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    req.body = {
      ...orderPayload,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    };

    return createOrder(req, res);
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
