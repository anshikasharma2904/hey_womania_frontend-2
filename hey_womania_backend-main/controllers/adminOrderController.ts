import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { SellPointLedger } from "../models/SellPointLedger";
import { InventoryLedger } from "../models/InventoryLedger";
import { IncomeLedger } from "../models/IncomeLedger";
import crypto from "crypto";
import { getSalesMonth } from "../utils/salesMonth";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const totalItems = await Order.countDocuments();
    const orders = await Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    
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
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingId } = req.body;

    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const previousStatus = order.status;
    
    // Update fields
    if (status) order.status = status;
    if (status) order.statusText = status;
    if (trackingId !== undefined) order.trackingId = trackingId;

    // Critical Business Logic: Finalize Sell Points on Delivery
    if (status === "Delivered" && previousStatus !== "Delivered") {
      console.log(`[MLM ENGINE] Order ${id} Delivered. Creating Sell Point Ledger entries...`);
      
      const now = new Date().toISOString();
      const totalNum = parseFloat(order.total?.replace(/[^0-9.]/g, "") || "0");
      // @ts-ignore
      const totalPoints = (order.sellPoints && order.sellPoints > 0) ? order.sellPoints : (totalNum / 5);

      const ledgerEntry = new SellPointLedger({
        id: crypto.randomUUID(),
        userId: order.userId,
        orderId: order.id,
        salesMonth: getSalesMonth(new Date(now)),
        sellPrice: totalNum,
        sellPoints: totalPoints,
        type: "Credit",
        status: "approved",
        remarks: `Order ${order.orderNumber} Delivered`,
        createdAt: now,
        updatedAt: now
      });

      await ledgerEntry.save();

      // Instant incomes are removed. They are now calculated during monthly closing.
    }

    // Enterprise Inventory Lifecycle: Status-Driven Stock Movements
    if (status !== previousStatus && order.items && order.items.length > 0) {
      const now = new Date().toISOString();

      for (const item of order.items) {
        if (!item.productId || !item.sku) continue;

        const qty = item.qty || 0;
        let incQuery: any = null;
        let ledgerType = "";

        if (status === "Shipped") {
          // Item leaves the warehouse. Deduct from Reserved.
          incQuery = { "variants.$.reservedStock": -qty };
          ledgerType = "Dispatch";
        } 
        else if (status === "Cancelled" || status === "Payment Failed") {
          // Release stock back to Available.
          // Only release if it hasn't been Shipped yet! (Assuming Cancelled happens before Shipped)
          if (previousStatus === "Pending" || previousStatus === "Confirmed" || previousStatus === "Packed") {
            incQuery = { "variants.$.reservedStock": -qty, "variants.$.availableStock": qty };
            ledgerType = status === "Cancelled" ? "Cancellation_Release" : "Payment_Failed_Release";
          }
        }
        else if (status === "Returned") {
          // Item came back from the customer. Send to Return Stock holding bucket.
          incQuery = { "variants.$.returnStock": qty };
          ledgerType = "Return";
        }

        if (incQuery) {
          // Atomic update
          await Product.findOneAndUpdate(
            { id: item.productId, "variants.sku": item.sku },
            { $inc: incQuery }
          );

          // Log movement
          const ledgerEntry = new InventoryLedger({
            id: crypto.randomUUID(),
            productId: item.productId,
            sku: item.sku,
            orderId: order.id,
            type: ledgerType,
            qtyChanged: qty, // absolute value for ledger, type indicates direction
            remarks: `Order status changed to ${status}`,
            createdAt: now
          });
          await ledgerEntry.save();
        }
      }
    }

    await order.save();
    
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
