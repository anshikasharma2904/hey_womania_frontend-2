import { Order } from "../models/Order";
import { User } from "../models/User";
import { PartnerDashboard } from "../models/PartnerDashboard";
import { IncomeLedger } from "../models/IncomeLedger";
import crypto from "crypto";

export const processReturnClawbacks = async () => {
  try {
    console.log("[CRON] Starting return clawbacks process...");
    
    // Find all returned orders where commission was not clawed back
    const returnedOrders = await Order.find({ 
      status: "Returned", 
      commissionClawedBack: { $ne: true } 
    });

    if (returnedOrders.length === 0) {
      console.log("[CRON] No returned orders to process for clawback.");
      return;
    }

    for (const order of returnedOrders) {
      const amountStr = order.total || "0";
      const orderAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
      
      if (isNaN(orderAmount) || orderAmount <= 0) {
        order.commissionClawedBack = true;
        await order.save();
        continue;
      }

      const buyerId = order.userId;
      const buyer = await User.findOne({ id: buyerId });
      
      if (!buyer) {
        order.commissionClawedBack = true;
        await order.save();
        continue;
      }

      // Determine the partner to get self income. If buyer is partner, it's buyer.
      // If buyer is member and has upline, self income goes to upline.
      let selfPartnerId = buyerId;
      if (buyer.role === "member" && buyer.uplineId) {
        selfPartnerId = buyer.uplineId;
      }

      const selfPartner = await User.findOne({ id: selfPartnerId });
      if (!selfPartner || selfPartner.role !== "partner") {
        // No commissions were paid out if not a partner
        order.commissionClawedBack = true;
        await order.save();
        continue;
      }

      const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM

      // Clawback Self Income (10%)
      const selfClawback = Math.floor(orderAmount * 0.10);
      if (selfClawback > 0) {
        await PartnerDashboard.updateOne(
          { userId: selfPartnerId },
          { 
            $inc: { 
              walletBalance: -selfClawback,
              sellPointsTotal: -orderAmount 
            } 
          }
        );
        
        await IncomeLedger.create({
          id: crypto.randomUUID(),
          userId: selfPartnerId,
          month: currentMonthStr,
          incomeType: "Self Sell Income",
          amount: -selfClawback,
          sellPointsBasis: -orderAmount,
          status: "approved",
          remarks: `Clawback for Returned Order ${order.orderNumber}`
        });
      }

      // Traverse up to 3 levels for Level Incomes
      let currentUplineId = selfPartner.uplineId;
      let level = 1;

      while (currentUplineId && level <= 3) {
        const rate = level === 1 ? 0.05 : level === 2 ? 0.03 : 0.02;
        const levelClawback = Math.floor(orderAmount * rate);

        if (levelClawback > 0) {
          // Decrement wallet balance and team sales (sellPointsTotal) for uplines
          await PartnerDashboard.updateOne(
            { userId: currentUplineId },
            { 
              $inc: { 
                networkWalletBalance: -levelClawback,
                walletBalance: -levelClawback,
                sellPointsTotal: -orderAmount
              } 
            }
          );

          await IncomeLedger.create({
            id: crypto.randomUUID(),
            userId: currentUplineId,
            month: currentMonthStr,
            incomeType: "Level Income",
            amount: -levelClawback,
            sellPointsBasis: -orderAmount,
            status: "approved",
            remarks: `Clawback Level ${level} for Returned Order ${order.orderNumber}`
          });
        }

        const uplineUser = await User.findOne({ id: currentUplineId });
        if (!uplineUser) break;
        currentUplineId = uplineUser.uplineId;
        level++;
      }

      // Mark order as clawed back
      order.commissionClawedBack = true;
      await order.save();
      console.log(`[CRON] Clawed back commissions for Order ${order.orderNumber}`);
    }

    console.log("[CRON] Return clawbacks process completed.");
  } catch (error) {
    console.error("[CRON] Error processing return clawbacks:", error);
  }
};
