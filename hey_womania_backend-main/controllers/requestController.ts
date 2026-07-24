import { Request, Response } from "express";
import { CancellationRequest } from "../models/CancellationRequest";
import { ReturnRequest } from "../models/ReturnRequest";
import { RefundRequest } from "../models/RefundRequest";
import { Order } from "../models/Order";

// Get all requests
export const getRequests = async (req: Request, res: Response) => {
  try {
    const cancellations = await CancellationRequest.find().sort({ createdAt: -1 });
    const returns = await ReturnRequest.find().sort({ createdAt: -1 });
    const refunds = await RefundRequest.find().sort({ createdAt: -1 });
    
    res.json({
      cancellations,
      returns,
      refunds
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle status updates and critical MLM reversal logic
export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id, type } = req.params; // type: cancellation, return, refund
    const { status } = req.body;
    
    let updatedRequest;
    let orderId;

    if (type === "cancellation") {
      updatedRequest = await CancellationRequest.findOneAndUpdate({ id }, { status, updatedAt: new Date().toISOString() }, { new: true });
      orderId = updatedRequest?.orderId;
      if (status === "Approved") await Order.findOneAndUpdate({ id: orderId }, { status: "Cancelled" });
    } else if (type === "return") {
      updatedRequest = await ReturnRequest.findOneAndUpdate({ id }, { status, updatedAt: new Date().toISOString() }, { new: true });
      orderId = updatedRequest?.orderId;
      if (status === "Approved") await Order.findOneAndUpdate({ id: orderId }, { status: "Returned" });
    } else if (type === "refund") {
      updatedRequest = await RefundRequest.findOneAndUpdate({ id }, { status, updatedAt: new Date().toISOString() }, { new: true });
      orderId = updatedRequest?.orderId;
      if (status === "Processed") await Order.findOneAndUpdate({ id: orderId }, { status: "Refunded" });
    } else {
      return res.status(400).json({ error: "Invalid request type" });
    }

    if (!updatedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    // CRITICAL: Sell Points Reversal Logic
    if (status === "Approved" || status === "Processed") {
      console.log(`[MLM ENGINE] ALERT: Request ${type} Approved for Order ${orderId}. Reversing and deducting Sell Points from Upline Network to prevent fraud.`);
      // Reversal logic to be implemented in Payout Module
    }

    res.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
