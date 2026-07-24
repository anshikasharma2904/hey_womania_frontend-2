import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { SellPointLedger } from "../models/SellPointLedger";
import { InventoryLedger } from "../models/InventoryLedger";
import { IncomeLedger } from "../models/IncomeLedger";
import crypto from "crypto";

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
        sellPrice: totalNum,
        sellPoints: totalPoints,
        type: "Credit",
        status: "approved",
        remarks: `Order ${order.orderNumber} Delivered`,
        createdAt: now,
        updatedAt: now
      });

      await ledgerEntry.save();

      // Instant Self Sell Income Credit for Partners
      const user = await User.findOne({ id: order.userId });
      if (user && user.role === "partner") {
        const selfSellIncome = totalPoints * 0.1; // 10% of SP
        const currentMonth = now.substring(0, 7); // Format: YYYY-MM
        
        // Log in Income Ledger
        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: user.id,
          month: currentMonth,
          incomeType: "Self Sell Income",
          amount: selfSellIncome,
          sellPointsBasis: totalPoints,
          status: "approved",
          remarks: `Instant Self Sell Income for Order ${order.orderNumber} Delivered`,
          createdAt: now,
          updatedAt: now
        }).save();

        // Update user wallet balance immediately
        const currentBalance = user.partnerProfile?.walletBalance || 0;
        await User.findOneAndUpdate(
          { id: user.id },
          { "partnerProfile.walletBalance": currentBalance + selfSellIncome }
        );
        console.log(`[MLM ENGINE] Credited ₹${selfSellIncome.toFixed(2)} Self Sell Income instantly to partner ${user.id}`);
      }

      // Upline Level Commissions (Level 1: 5%, Level 2: 3%, Level 3: 2%)
      const commissionLevels = [
        { percentage: 0.05, label: "Level 1" },
        { percentage: 0.03, label: "Level 2" },
        { percentage: 0.02, label: "Level 3" }
      ];

      let currentUplineId = user?.uplineId;
      const orderPlacerName = user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : "a customer";

      for (let i = 0; i < commissionLevels.length; i++) {
        if (!currentUplineId) break;

        const upline = await User.findOne({ id: currentUplineId });
        if (!upline) break;

        if (upline.role === "partner") {
          const levelInfo = commissionLevels[i];
          const commissionAmount = totalPoints * levelInfo.percentage;

          await new IncomeLedger({
            id: crypto.randomUUID(),
            userId: upline.id,
            month: now.substring(0, 7),
            incomeType: "Fast Track Income",
            amount: commissionAmount,
            sellPointsBasis: totalPoints,
            status: "approved",
            remarks: `${levelInfo.label} Referral Income (${(levelInfo.percentage * 100)}%) from ${orderPlacerName} (Order ${order.orderNumber})`,
            createdAt: now,
            updatedAt: now
          }).save();

          const uplineBalance = upline.partnerProfile?.walletBalance || 0;
          await User.findOneAndUpdate(
            { id: upline.id },
            { "partnerProfile.walletBalance": uplineBalance + commissionAmount }
          );
          console.log(`[MLM ENGINE] Credited ₹${commissionAmount.toFixed(2)} (${levelInfo.label}) to upline partner ${upline.id}`);
        }

        currentUplineId = upline.uplineId;
      }
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
