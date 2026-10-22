import { Request, Response } from "express";
import crypto from "crypto";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Build user match criteria: match by userId OR by customer phone (for guest-checkout orders)
    const orderConditions: any[] = [{ userId }];

    const user = await User.findOne({ id: userId });
    if (user && user.phone) {
      const rawPhone = String(user.phone).trim().replace(/[^0-9]/g, "");
      const normalizedPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
      if (normalizedPhone && normalizedPhone.length >= 10) {
        orderConditions.push({ "address.phone": normalizedPhone });
        orderConditions.push({ "address.phone": `+91${normalizedPhone}` });
        orderConditions.push({ "address.phone": `91${normalizedPhone}` });
        orderConditions.push({ "address.phone": user.phone });
      }
    }

    const filterQuery = orderConditions.length === 1 ? orderConditions[0] : { $or: orderConditions };

    const totalItems = await Order.countDocuments(filterQuery);
    let orders = await Order.find(filterQuery).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({
      data: orders,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { id } = req.params;

    const orderConditions: any[] = [{ userId }];

    const user = await User.findOne({ id: userId });
    if (user && user.phone) {
      const rawPhone = String(user.phone).trim().replace(/[^0-9]/g, "");
      const normalizedPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
      if (normalizedPhone && normalizedPhone.length >= 10) {
        orderConditions.push({ "address.phone": normalizedPhone });
        orderConditions.push({ "address.phone": `+91${normalizedPhone}` });
        orderConditions.push({ "address.phone": `91${normalizedPhone}` });
        orderConditions.push({ "address.phone": user.phone });
      }
    }

    const order = await Order.findOne({
      $or: [
        { id: id },
        { orderNumber: id }
      ],
      $and: [
        { $or: orderConditions }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

import mongoose from "mongoose";
import { InventoryLedger } from "../models/InventoryLedger";
import { createShiprocketShipmentForOrder } from "../services/shiprocketService";
import { findOrCreateUserFromShipping } from "./userController";
import { createSessionToken } from "../utils/authHelpers";

export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  let newOrder: any = null;
  const orderId = crypto.randomUUID();

  try {
    // @ts-ignore
    let userId = req.user?.id || "guest-user";
    const { items, address, paymentMethod, total, useWallet, useNetworkWallet } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order items cannot be empty" });
    }

    // Auto-create or link user from shipping details if ordering without signup/login or if userId is missing/guest
    let autoCreatedOrLinkedUser: any = null;
    if (address && address.phone) {
      try {
        autoCreatedOrLinkedUser = await findOrCreateUserFromShipping(address);
        if (autoCreatedOrLinkedUser) {
          // If the caller was a guest or unauthenticated, attach the order directly to this user's account
          if (!userId || userId === "guest-user") {
            userId = autoCreatedOrLinkedUser.id;
          }

          // Issue session cookie so the user is immediately logged in with their profile
          try {
            const token = createSessionToken({
              id: autoCreatedOrLinkedUser.id,
              role: (autoCreatedOrLinkedUser.role || "member") as string
            });
            res.cookie("hey_womania_session", token, {
              httpOnly: true,
              secure: true,
              maxAge: 60 * 60 * 24 * 60 * 1000,
              path: "/",
              sameSite: "none"
            });
          } catch (cookieErr) {
            console.warn("Could not set session cookie for guest user:", cookieErr);
          }
        }
      } catch (guestUserErr) {
        console.error("Error creating/linking guest user profile:", guestUserErr);
      }
    }

    const now = new Date().toISOString();
    const orderNumber = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6 digit

    await session.withTransaction(async () => {
      let walletDiscount = 0;
      let networkWalletDiscount = 0;

      let subtotal = 0;
      for (const item of items) {
        // Free surprise promotional gift bypass
        if (item.isFreeGift || item.sku === "SURPRISE-GIFT" || item.productId === "surprise-gift") {
          item.qty = 1;
          item.price = 0;
          continue;
        }

        const product = await Product.findOne({ id: item.productId }).session(session);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        const qty = parseInt(item.qty || item.quantity || "1", 10);
        if (isNaN(qty) || qty <= 0) {
          throw new Error(`Invalid quantity for item ${item.sku}`);
        }

        const actualPrice = product.salePrice > 0 ? product.salePrice : product.price;
        subtotal += actualPrice * qty;

        // Overwrite the frontend data with clean backend data
        item.qty = qty;
        item.price = actualPrice;
      }

      let deliveryFee = subtotal >= 999 ? 0 : 99; // Fallback calculation
      if (typeof req.body.deliveryFee === "number") {
        deliveryFee = req.body.deliveryFee;
      }

      if (userId !== "guest-user") {
        const user = await User.findOne({ id: userId }).session(session);
        if (user && user.partnerProfile) {
          let isFirstOrder = false;
          if (user.partnerProfile.walletBalance > 0) {
            const pastOrderCount = await Order.countDocuments({ userId: userId }).session(session);
            isFirstOrder = pastOrderCount === 0;
          }

          if (useWallet && isFirstOrder && user.partnerProfile.walletBalance > 0) {
            const walletBalance = user.partnerProfile.walletBalance;
            const maxDiscount = subtotal * 0.05;
            walletDiscount = Math.floor(Math.min(walletBalance, maxDiscount));
          }

          if (useNetworkWallet && user.partnerProfile.networkWalletBalance > 0) {
            const networkWalletBalance = user.partnerProfile.networkWalletBalance;
            // Network wallet discounts can be applied to the remaining total
            const remainingTotalBeforeNetwork = subtotal + deliveryFee - walletDiscount;
            networkWalletDiscount = Math.floor(Math.min(networkWalletBalance, remainingTotalBeforeNetwork));
          }

          const clearShippingWallet = isFirstOrder && user.partnerProfile.walletBalance > 0;

          if (walletDiscount > 0 || networkWalletDiscount > 0 || clearShippingWallet) {
            const updateSetQuery: any = {};
            const updateIncQuery: any = {};

            if (clearShippingWallet) {
              // Entirely wipe the shipping wallet balance on the first order
              updateSetQuery["partnerProfile.walletBalance"] = 0;
            } else if (walletDiscount > 0) {
              updateIncQuery["partnerProfile.walletBalance"] = -walletDiscount;
            }

            if (networkWalletDiscount > 0) {
              updateIncQuery["partnerProfile.networkWalletBalance"] = -networkWalletDiscount;
            }

            const updateOp: any = {};
            if (Object.keys(updateSetQuery).length > 0) updateOp.$set = updateSetQuery;
            if (Object.keys(updateIncQuery).length > 0) updateOp.$inc = updateIncQuery;

            const findQuery: any = { id: userId };
            if (!clearShippingWallet && walletDiscount > 0) findQuery["partnerProfile.walletBalance"] = { $gte: walletDiscount };
            if (networkWalletDiscount > 0) findQuery["partnerProfile.networkWalletBalance"] = { $gte: networkWalletDiscount };

            const updatedUser = await User.findOneAndUpdate(
              findQuery,
              updateOp,
              { new: true, session }
            );

            if (!updatedUser) {
              throw new Error("Failed to apply wallet discount. Insufficient balance.");
            }
          }

          // Referral commission is deliberately not credited during checkout.
          // It is calculated from paid, delivered orders by the monthly closing
          // job on the 10th, after the order is no longer merely pending.
        }
      }

      // 1. Atomic Stock Reservation Loop with ACID Transaction
      for (const item of items) {
        // Free surprise promotional gift bypass
        if (item.isFreeGift || item.sku === "SURPRISE-GIFT" || item.productId === "surprise-gift") {
          continue;
        }

        const updatedProduct = await Product.findOneAndUpdate(
          {
            id: item.productId,
            "variants.sku": item.sku,
            "variants.availableStock": { $gte: item.qty } // Atomic safety check
          },
          {
            $inc: {
              "variants.$.availableStock": -item.qty,
              "variants.$.reservedStock": item.qty
            }
          },
          { new: true, session }
        );

        if (!updatedProduct) {
          // Throwing an error aborts the entire transaction automatically
          throw new Error(`Order failed. Item out of stock or unavailable: ${item.sku}`);
        }

        // Log to Inventory Ledger
        const ledgerEntry = new InventoryLedger({
          id: crypto.randomUUID(),
          productId: item.productId,
          sku: item.sku,
          orderId: orderId,
          type: "Reservation",
          qtyChanged: -item.qty,
          remarks: `Reserved for Order ${orderNumber}`,
          createdAt: now
        });
        await ledgerEntry.save({ session });
      }

      // Promo Code Validation: WELCOME100 (₹100 flat off for first-time orders)
      const rawCouponCode = String(req.body.couponCode || "").trim().toUpperCase();
      let couponDiscount = 0;
      let couponCode = "";

      const cleanCouponReq = rawCouponCode.replace(/[^A-Z0-9]/g, "");

      if (cleanCouponReq === "WELCOME100") {
        let isFirstTimeCustomer = true;
        const recipientPhone = String(address?.phone || "").trim().replace(/[^0-9]/g, "");
        const normalizedPhone = recipientPhone.length > 10 ? recipientPhone.slice(-10) : recipientPhone;

        const pastOrderFilters: any[] = [];
        if (userId && userId !== "guest-user") {
          pastOrderFilters.push({ userId });
        }
        if (normalizedPhone && normalizedPhone.length >= 10) {
          pastOrderFilters.push({ "address.phone": normalizedPhone });
          pastOrderFilters.push({ "address.phone": `+91${normalizedPhone}` });
          pastOrderFilters.push({ "address.phone": `91${normalizedPhone}` });

          const existingUserWithPhone = await User.findOne({
            $or: [
              { phone: normalizedPhone },
              { phone: `+91${normalizedPhone}` },
              { phone: `91${normalizedPhone}` }
            ]
          }).session(session);

          if (existingUserWithPhone) {
            pastOrderFilters.push({ userId: existingUserWithPhone.id });
          }
        }

        if (pastOrderFilters.length > 0) {
          const pastOrderCount = await Order.countDocuments({
            $or: pastOrderFilters,
            status: { $ne: "Cancelled" }
          }).session(session);
          isFirstTimeCustomer = pastOrderCount === 0;
        }

        if (isFirstTimeCustomer) {
          couponCode = "WELCOME100";
          couponDiscount = Math.min(100, subtotal);

          // Deduct the 100 Rs promo from the shopping wallet (wipe welcome bonus)
          if (userId !== "guest-user") {
            await User.findOneAndUpdate(
              { id: userId },
              { $inc: { "partnerProfile.walletBalance": -couponDiscount } },
              { session }
            );
            // Ensure wallet balance doesn't drop below 0
            await User.findOneAndUpdate(
              { id: userId, "partnerProfile.walletBalance": { $lt: 0 } },
              { $set: { "partnerProfile.walletBalance": 0 } },
              { session }
            );
          }
        }
      } else if (cleanCouponReq === "DIWALI10") {
        const recipientPhone = String(address?.phone || "").trim().replace(/[^0-9]/g, "");
        const normalizedPhone = recipientPhone.length > 10 ? recipientPhone.slice(-10) : recipientPhone;

        const pastOrderFilters: any[] = [];
        if (userId && userId !== "guest-user") {
          pastOrderFilters.push({ userId });
        }
        if (normalizedPhone && normalizedPhone.length >= 10) {
          pastOrderFilters.push({ "address.phone": normalizedPhone });
          pastOrderFilters.push({ "address.phone": `+91${normalizedPhone}` });
          pastOrderFilters.push({ "address.phone": `91${normalizedPhone}` });

          const existingUserWithPhone = await User.findOne({
            $or: [
              { phone: normalizedPhone },
              { phone: `+91${normalizedPhone}` },
              { phone: `91${normalizedPhone}` }
            ]
          }).session(session);

          if (existingUserWithPhone) {
            pastOrderFilters.push({ userId: existingUserWithPhone.id });
          }
        }

        if (pastOrderFilters.length > 0) {
          const completedOrders = await Order.find({
            $or: pastOrderFilters,
            status: { $ne: "Cancelled" }
          }).sort({ createdAt: 1 }).session(session).lean();

          if (completedOrders.length > 0) {
            const alreadyUsed = completedOrders.some((o: any) =>
              String(o.couponCode || "").replace(/[^A-Z0-9]/g, "").toUpperCase() === "DIWALI10"
            );

            if (!alreadyUsed) {
              const firstOrder = completedOrders[0];
              const firstOrderTotal = parseFloat(String(firstOrder.total || "0").replace(/[^0-9.]/g, "")) || 0;
              const diwaliDeduction = Math.max(1, Math.round(firstOrderTotal * 0.10));

              couponCode = "DIWALI10";
              couponDiscount = Math.min(diwaliDeduction, subtotal);
            }
          }
        }
      }

      const secureTotalAmount = Math.max(0, subtotal + deliveryFee - walletDiscount - networkWalletDiscount - couponDiscount);
      const secureTotalString = `₹${secureTotalAmount.toLocaleString("en-IN")}`;

      // 2. All items reserved successfully. Create the Order.
      newOrder = new Order({
        id: orderId,
        userId,
        orderNumber,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: secureTotalString,
        walletDiscount,
        networkWalletDiscount,
        couponCode,
        couponDiscount,
        sellPoints: 0,
        status: "Pending",
        statusText: "We are processing your order",
        activeStep: 1,
        paymentMethod: paymentMethod || "cod",
        paymentMode: paymentMethod ? paymentMethod.toUpperCase() : "COD",
        paymentStatus: String(paymentMethod || "").toUpperCase() === "COD" ? "Pending" : (res.locals.isVerifiedRazorpay ? "Paid" : "Pending"),
        razorpayOrderId: req.body.razorpayOrderId,
        razorpayPaymentId: req.body.razorpayPaymentId,
        address,
        items: (items || []).map((item: any) => ({
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          qty: item.qty || item.quantity || 1,
          price: typeof item.price === "number" ? `₹${item.price.toLocaleString("en-IN")}` : String(item.price),
          img: item.img || item.image || "",
          images: item.images || [],
          size: item.size || "",
          color: item.color || "",
          sellPoints: item.sellPoints || 0
        })),
        createdAt: now
      });

      await newOrder.save({ session });
    });

    // 3. Post-transaction external APIs (Shiprocket)
    // This executes only if the transaction committed successfully
    try {
      if (newOrder) {
        await createShiprocketShipmentForOrder(newOrder);
      }
    } catch (shipmentError) {
      const message = shipmentError instanceof Error ? shipmentError.message : "Shiprocket shipment creation failed";
      console.error("Shiprocket shipment creation failed:", message);
      await Order.findOneAndUpdate(
        { id: orderId },
        {
          shippingProvider: "Shiprocket",
          shippingStatus: "Failed",
          shippingError: message
        }
      );
    }

    res.status(201).json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error("Error creating order:", error);
    if (error.message && error.message.includes("out of stock")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
};

import { cancelShiprocketOrders } from "../services/shiprocketService";

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user?.id || "guest-user";

    const order = await Order.findOne({
      $or: [{ id: id }, { orderNumber: id }]
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === "Cancelled" || order.status === "Shipped" || order.status === "Delivered") {
      return res.status(400).json({ error: "Order cannot be cancelled in its current status." });
    }

    // Attempt to cancel in Shiprocket if it has a shipping ID
    if (order.shiprocketOrderId) {
      try {
        await cancelShiprocketOrders([order.shiprocketOrderId]);
      } catch (err) {
        console.warn("Failed to cancel in Shiprocket, proceeding with local cancellation:", err);
      }
    }

    // Restore stock
    for (const item of order.items) {
      if (item.sku) {
        const product = await Product.findOne({ "variants.sku": item.sku });
        if (product) {
          const variant = product.variants.find((v: any) => v.sku === item.sku);
          if (variant && variant.availableStock !== undefined) {
            variant.availableStock += item.qty || 1;
            await product.save();
          }
        }
      }
    }

    order.status = "Cancelled";
    order.statusText = "Cancelled by user";
    order.shippingStatus = "Cancelled";

    // Automatic Refund Processing via Razorpay API
    let refundInfo: any = null;
    if (order.razorpayPaymentId) {
      try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (keyId && keySecret) {
          const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

          // Check payment status on Razorpay first
          const paymentCheckRes = await fetch(`https://api.razorpay.com/v1/payments/${order.razorpayPaymentId}`, {
            headers: { Authorization: authHeader }
          });

          if (paymentCheckRes.ok) {
            const paymentData: any = await paymentCheckRes.json();
            
            // Only refund if payment was captured and not already refunded
            if (paymentData.status === "captured" && paymentData.refund_status !== "full") {
              const refundAmountPaisa = paymentData.amount - (paymentData.amount_refunded || 0);

              if (refundAmountPaisa > 0) {
                const refundRes = await fetch(`https://api.razorpay.com/v1/payments/${order.razorpayPaymentId}/refund`, {
                  method: "POST",
                  headers: {
                    Authorization: authHeader,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    amount: refundAmountPaisa,
                    notes: {
                      orderNumber: order.orderNumber,
                      reason: "Cancelled by user before shipping"
                    }
                  })
                });

                if (refundRes.ok) {
                  const refundData: any = await refundRes.json();
                  order.refundId = refundData.id;
                  order.refundStatus = refundData.status || "processed";
                  order.refundAmount = refundAmountPaisa / 100;
                  order.refundedAt = new Date().toISOString();
                  order.paymentStatus = "Refunded";
                  order.statusText = `Cancelled by user. ₹${refundAmountPaisa / 100} refund initiated.`;

                  refundInfo = {
                    refundId: refundData.id,
                    amount: refundAmountPaisa / 100,
                    status: refundData.status
                  };
                } else {
                  const errPayload = await refundRes.json().catch(() => ({}));
                  console.error("Razorpay refund error:", errPayload);
                }
              }
            }
          }
        }
      } catch (refundError) {
        console.error("Failed to process automatic refund via Razorpay:", refundError);
      }
    }

    await order.save();

    res.json({
      success: true,
      message: refundInfo
        ? `Order cancelled and ₹${refundInfo.amount} refund automatically initiated to original payment method.`
        : "Order cancelled successfully.",
      refund: refundInfo
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cleanupAbandonedOrders = async (req: Request, res: Response) => {
  try {
    // Find all "Pending" Razorpay orders created more than 60 minutes ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const abandonedOrders = await Order.find({
      status: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "Razorpay",
      createdAt: { $lt: oneHourAgo }
    });

    let count = 0;
    for (const order of abandonedOrders) {
      // Restore stock
      for (const item of order.items) {
        if (item.sku) {
          const product = await Product.findOne({ "variants.sku": item.sku });
          if (product) {
            const variant = product.variants.find((v: any) => v.sku === item.sku);
            if (variant && variant.availableStock !== undefined) {
              // Also release reserved stock if tracked
              variant.availableStock += item.qty || 1;
              if (variant.reservedStock !== undefined && variant.reservedStock >= (item.qty || 1)) {
                variant.reservedStock -= item.qty || 1;
              }
              await product.save();
            }
          }
        }
      }

      order.status = "Cancelled";
      order.statusText = "Abandoned Cart Cancelled";
      await order.save();
      count++;
    }

    res.json({ success: true, message: `Cleaned up ${count} abandoned orders.` });
  } catch (error) {
    console.error("Error in cleanupAbandonedOrders:", error);
    res.status(500).json({ error: "Internal server error during cleanup" });
  }
};

export const returnOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user?.id || "guest-user";

    const order = await Order.findOne({
      $or: [{ id: id }, { orderNumber: id }]
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ error: "Only delivered orders can be returned." });
    }

    if (!order.deliveredAt) {
      return res.status(400).json({ error: "Delivery date is missing, cannot process return." });
    }

    const deliveredDate = new Date(order.deliveredAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (deliveredDate < sevenDaysAgo) {
      return res.status(400).json({ error: "Order was delivered more than 7 days ago. Return period has expired." });
    }

    order.status = "Return Requested";
    order.statusText = "Return has been requested";
    order.returnRequestedAt = new Date().toISOString();
    if (req.body.reason) {
      order.returnReason = String(req.body.reason).trim();
    }

    // Production-ready Shiprocket Reverse Pickup / Return Order creation
    let shiprocketReturnData: any = null;
    try {
      const { createShiprocketReturnOrder } = await import("../services/shiprocketService");
      shiprocketReturnData = await createShiprocketReturnOrder(order, req.body.reason);
      if (shiprocketReturnData) {
        order.returnShiprocketOrderId = String(shiprocketReturnData.order_id || shiprocketReturnData.orderId || "");
        order.returnShiprocketShipmentId = String(shiprocketReturnData.shipment_id || shiprocketReturnData.shipmentId || "");
        if (shiprocketReturnData.awb_code || shiprocketReturnData.awb) {
          order.returnAwb = String(shiprocketReturnData.awb_code || shiprocketReturnData.awb);
          order.returnTrackingUrl = `https://shiprocket.co/tracking/${order.returnAwb}`;
        }
      }
    } catch (srErr: any) {
      console.error("[SHIPROCKET RETURN ORDER ERROR]:", srErr.message || srErr);
      // Non-fatal: the return request is recorded in database, admin can view & retry/dispatch in Shiprocket
    }

    await order.save();

    res.json({
      success: true,
      message: "Return requested successfully.",
      returnOrder: {
        orderId: order.orderNumber || order.id,
        status: order.status,
        shiprocketReturnOrderId: order.returnShiprocketOrderId,
        returnAwb: order.returnAwb
      }
    });
  } catch (error) {
    console.error("Error returning order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Check if a promo code (like WELCOME100) is eligible for a given user or shipping phone.
 * Prevents guest and repeat users from abusing the first-time welcome coupon.
 */
export const checkPromoEligibility = async (req: Request, res: Response) => {
  try {
    const rawCoupon = String(req.query.code || req.body.code || "").trim().toUpperCase();
    const phone = String(req.query.phone || req.body.phone || "").trim().replace(/[^0-9]/g, "");
    // @ts-ignore
    const userId = req.user?.id;

    if (!rawCoupon) {
      return res.status(400).json({ eligible: false, message: "Promo code is required." });
    }

    const cleanCoupon = rawCoupon.replace(/[^A-Z0-9]/g, "");

    if (cleanCoupon !== "WELCOME100" && cleanCoupon !== "DIWALI10") {
      return res.status(400).json({ eligible: false, message: "Invalid promo code." });
    }

    const normalizedPhone = phone.length > 10 ? phone.slice(-10) : phone;

    // Build query conditions to detect existing orders
    const pastOrderConditions: any[] = [];

    if (userId && userId !== "guest-user") {
      pastOrderConditions.push({ userId });
    }

    if (normalizedPhone && normalizedPhone.length >= 10) {
      pastOrderConditions.push({ "address.phone": normalizedPhone });
      pastOrderConditions.push({ "address.phone": `+91${normalizedPhone}` });
      pastOrderConditions.push({ "address.phone": `91${normalizedPhone}` });

      const existingUser = await User.findOne({
        $or: [
          { phone: normalizedPhone },
          { phone: `+91${normalizedPhone}` },
          { phone: `91${normalizedPhone}` }
        ]
      });

      if (existingUser) {
        pastOrderConditions.push({ userId: existingUser.id });
      }
    }

    // 1. WELCOME100 handling (First order only)
    if (cleanCoupon === "WELCOME100") {
      if (pastOrderConditions.length > 0) {
        const pastOrdersCount = await Order.countDocuments({
          $or: pastOrderConditions,
          status: { $ne: "Cancelled" }
        });

        if (pastOrdersCount > 0) {
          return res.json({
            eligible: false,
            code: "WELCOME100",
            discount: 0,
            message: "WELCOME100 is valid only on your first purchase."
          });
        }
      }

      return res.json({
        eligible: true,
        code: "WELCOME100",
        discount: 100,
        message: "Coupon WELCOME100 applied successfully! ₹100 saved."
      });
    }

    // 2. DIWALI10 handling (Second order: 10% of first order value)
    if (cleanCoupon === "DIWALI10") {
      if (pastOrderConditions.length === 0) {
        return res.json({
          eligible: false,
          code: "DIWALI10",
          discount: 0,
          message: "Please enter your 10-digit mobile number in the shipping address first to verify eligibility."
        });
      }

      // Find all completed/non-cancelled orders
      const completedOrders = await Order.find({
        $or: pastOrderConditions,
        status: { $ne: "Cancelled" }
      }).sort({ createdAt: 1 }).lean();

      if (completedOrders.length === 0) {
        return res.json({
          eligible: false,
          code: "DIWALI10",
          discount: 0,
          message: "Diwali 10% is an exclusive reward unlocked after your first purchase."
        });
      }

      // Check if DIWALI10 has already been used on a subsequent order
      const alreadyUsedDiwali = completedOrders.some((o: any) =>
        String(o.couponCode || "").replace(/[^A-Z0-9]/g, "").toUpperCase() === "DIWALI10"
      );

      if (alreadyUsedDiwali) {
        return res.json({
          eligible: false,
          code: "DIWALI10",
          discount: 0,
          message: "Diwali 10% promo code has already been redeemed."
        });
      }

      // Calculate 10% of the first order's total
      const firstOrder = completedOrders[0];
      const numericFirstOrderTotal = parseFloat(String(firstOrder.total || "0").replace(/[^0-9.]/g, "")) || 0;
      const diwaliDiscount = Math.max(1, Math.round(numericFirstOrderTotal * 0.10));

      return res.json({
        eligible: true,
        code: "DIWALI10",
        discount: diwaliDiscount,
        firstOrderTotal: numericFirstOrderTotal,
        message: `Diwali 10% applied! ₹${diwaliDiscount} saved (10% reward from your first order of ₹${numericFirstOrderTotal.toLocaleString("en-IN")}).`
      });
    }
  } catch (error) {
    console.error("Error checking promo eligibility:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
