import { Request, Response } from "express";
import crypto from "crypto";
import { Order } from "../models/Order";
import { Product } from "../models/Product";

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
          items: [{ name: "Clean Line Co-ord", qty: 2, price: "₹2,150", img: "/products/product-western-1.png" }],
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

import { InventoryLedger } from "../models/InventoryLedger";
import { createShiprocketShipmentForOrder } from "../services/shiprocketService";

export const createOrder = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id || "guest-user";
    const { items, address, paymentMethod, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order items cannot be empty" });
    }

    const now = new Date().toISOString();
    const orderNumber = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6 digit
    const orderId = crypto.randomUUID();

    // 1. Atomic Stock Reservation Loop with Manual Rollback Capability
    const successfullyReservedItems: any[] = [];
    
    for (const item of items) {
      // Attempt atomic deduction
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
        { new: true }
      );

      if (!updatedProduct) {
        // ATOMIC FAILURE: Out of stock or invalid SKU during exact ms of transaction
        // ROLLBACK all previously reserved items in this loop
        for (const rollbackItem of successfullyReservedItems) {
          await Product.findOneAndUpdate(
            { id: rollbackItem.productId, "variants.sku": rollbackItem.sku },
            { $inc: { "variants.$.availableStock": rollbackItem.qty, "variants.$.reservedStock": -rollbackItem.qty } }
          );
        }
        
        return res.status(400).json({ 
          error: `Order failed. Item out of stock or unavailable: ${item.sku}` 
        });
      }

      successfullyReservedItems.push(item);
      
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
      await ledgerEntry.save();
    }

    // 2. All items reserved successfully. Create the Order.
    const newOrder = new Order({
      id: orderId,
      userId,
      orderNumber,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      total,
      sellPoints: req.body.sellPoints || 0,
      status: "Pending",
      statusText: "We are processing your order",
      activeStep: 1,
      paymentMethod,
      paymentStatus: req.body.paymentStatus || (paymentMethod === "cod" ? "COD" : "Pending"),
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
        sellPoints: item.sellPoints || 0
      })),
      createdAt: now
    });

    await newOrder.save();

    try {
      await createShiprocketShipmentForOrder(newOrder);
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
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
