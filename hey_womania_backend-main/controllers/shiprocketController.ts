import { Request, Response } from "express";
import { Order } from "../models/Order";
import {
  applyShiprocketWebhook,
  assignShiprocketAwb,
  cancelShiprocketOrders,
  checkCourierServiceability,
  createShiprocketOrder,
  generateShiprocketInvoice,
  generateShiprocketLabel,
  getShiprocketToken,
  loginToShiprocket,
  trackShiprocketShipment
} from "../services/shiprocketService";

function sendError(res: Response, error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  return res.status(500).json({ error: message });
}

export const loginShiprocket = async (_req: Request, res: Response) => {
  try {
    await loginToShiprocket();
    return res.json({ success: true, message: "Shiprocket authenticated" });
  } catch (error) {
    return sendError(res, error, "Shiprocket login failed");
  }
};

export const getShiprocketAuthStatus = async (_req: Request, res: Response) => {
  try {
    await getShiprocketToken();
    return res.json({ configured: true, authenticated: true });
  } catch (error) {
    return res.json({
      configured: Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD),
      authenticated: false,
      error: error instanceof Error ? error.message : "Shiprocket unavailable"
    });
  }
};

export const serviceability = async (req: Request, res: Response) => {
  try {
    const params = { ...req.query, ...req.body };
    const data = await checkCourierServiceability(params);
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error, "Shiprocket serviceability check failed");
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const input = req.body.orderId
      ? await Order.findOne({ $or: [{ id: req.body.orderId }, { orderNumber: req.body.orderId }] })
      : null;

    const result = await createShiprocketOrder(input || req.body);
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return sendError(res, error, "Shiprocket order creation failed");
  }
};

export const assignAwb = async (req: Request, res: Response) => {
  try {
    if (!req.body.shipment_id) {
      return res.status(400).json({ error: "shipment_id is required" });
    }

    const data = await assignShiprocketAwb(req.body.shipment_id);
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error, "Shiprocket AWB assignment failed");
  }
};

export const generateLabel = async (req: Request, res: Response) => {
  try {
    if (!req.body.shipment_id) {
      return res.status(400).json({ error: "shipment_id is required" });
    }

    const data = await generateShiprocketLabel(req.body.shipment_id);
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error, "Shiprocket label generation failed");
  }
};

export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const ids = req.body.ids || req.body.order_ids || req.body.orderIds;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids is required" });
    }

    const data = await generateShiprocketInvoice(ids);
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error, "Shiprocket invoice generation failed");
  }
};

export const trackShipment = async (req: Request, res: Response) => {
  try {
    const data = await trackShiprocketShipment(req.params.awb);
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error, "Shiprocket tracking failed");
  }
};

export const cancelShipment = async (req: Request, res: Response) => {
  try {
    const ids = req.body.ids || req.body.order_ids || req.body.orderIds;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids is required" });
    }

    const data = await cancelShiprocketOrders(ids);
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error, "Shiprocket cancellation failed");
  }
};

export const shiprocketWebhook = async (req: Request, res: Response) => {
  try {
    const shipment = await applyShiprocketWebhook(req.body);
    return res.json({ success: true, shipment });
  } catch (error) {
    return sendError(res, error, "Shiprocket webhook failed");
  }
};
