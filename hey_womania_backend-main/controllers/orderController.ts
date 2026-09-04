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

    const totalItems = await Order.countDocuments({ userId });
    let orders = await Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    // Auto-mocking logic if no orders exist
    if (orders.length === 0 && page === 1) {
      const now = new Date().toISOString();
      const mockOrders = [
        {
          id: crypto.randomUUID(),
          userId,
          orderNumber: "1",
          date: "May 28, 2026",
          total: "₹1,299",
          status: "Delivered",
          statusText: "Delivered on May 30, 2026",
          activeStep: 4,
          paymentMethod: "Credit Card ending in 4242",
          address: {
            name: "Priya Sharma",
            street: "Spaze Itech Tower, Sector 49",
            city: "Gurgaon, Haryana 122018",
            phone: "+91 98765 43210"
          },
          items: [{ name: "Ceremonial Light Saree", qty: 1, price: "₹1,299", img: "/products/product-traditional-1.png" }],
          createdAt: now
        },
        {
          id: crypto.randomUUID(),
          userId,
          orderNumber: "2",
          date: "Jun 10, 2026",
          total: "₹4,500",
          status: "Ongoing",
          statusText: "Arriving by Jun 15, 2026",
          activeStep: 2,
          paymentMethod: "Credit Card ending in 4242",
          address: {
            name: "Priya Sharma",
            street: "Spaze Itech Tower, Sector 49",
            city: "Gurgaon, Haryana 122018",
            phone: "+91 98765 43210"
          },
          items: [{ name: "Studio Evening Dress", qty: 1, price: "₹4,500", img: "/products/product-couture-1.png" }],
          createdAt: now
        },
        {
          id: crypto.randomUUID(),
          userId,
          orderNumber: "3",
          date: "Jun 14, 2026",
          total: "₹2,150",
          status: "Pending",
          statusText: "Preparing your order",
          activeStep: 1,
          paymentMethod: "UPI",
          address: {
            name: "Priya Sharma",
            street: "Spaze Itech Tower, Sector 49",
            city: "Gurgaon, Haryana 122018",
            phone: "+91 98765 43210"
          },
          items: [{ name: "Clean Line Co-Ord", qty: 2, price: "₹2,150", img: "/products/product-western-1.png" }],
          createdAt: now
        },
        {
          id: crypto.randomUUID(),
          userId,
          orderNumber: "4",
          date: "Jan 12, 2026",
          total: "₹8,990",
          status: "Delivered",
          statusText: "Delivered on Jan 15, 2026",
          activeStep: 4,
          paymentMethod: "Credit Card ending in 4242",
          address: {
            name: "Priya Sharma",
            street: "Spaze Itech Tower, Sector 49",
            city: "Gurgaon, Haryana 122018",
            phone: "+91 98765 43210"
          },
          items: [{ name: "Arah Festive Lehenga", qty: 1, price: "₹8,990", img: "/products/product-traditional-2.png" }],
          createdAt: now
        }
      ];
      await Order.insertMany(mockOrders);
      orders = mockOrders as any;
    }

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
    
    const order = await Order.findOne({ orderNumber: id, userId });
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

export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  let newOrder: any = null;
  const orderId = crypto.randomUUID();

  try {
    // @ts-ignore
    const userId = req.user?.id || "guest-user";
    const { items, address, paymentMethod, total, useWallet, useNetworkWallet } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order items cannot be empty" });
    }

    const now = new Date().toISOString();
    const orderNumber = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6 digit

    await session.withTransaction(async () => {
      let walletDiscount = 0;
      let networkWalletDiscount = 0;
      
      let subtotal = 0;
      for (const item of items) {
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

      const secureTotalAmount = subtotal + deliveryFee - walletDiscount - networkWalletDiscount;
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
        sellPoints: 0,
        status: "Pending",
        statusText: "We are processing your order",
        activeStep: 1,
        paymentMethod,
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
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully." });
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
