import { Request, Response } from "express";
import crypto from "crypto";
import { Shipment } from "../models/Shipment";
import { Order } from "../models/Order";
import { createShiprocketShipmentForOrder } from "../services/shiprocketService";

export const getShipments = async (req: Request, res: Response) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (error) {
    console.error("Error fetching shipments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createShipment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    const existing = await Shipment.findOne({ orderId: data.orderId });
    if (existing) {
      return res.status(400).json({ error: "A shipment already exists for this order" });
    }

    const now = new Date().toISOString();
    const newShipment = new Shipment({
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now
    });

    await newShipment.save();
    
    // Also update the order status
    await Order.findOneAndUpdate(
      { id: data.orderId }, 
      { status: "Shipped", trackingId: data.awbNumber }
    );

    res.status(201).json({ success: true, shipment: newShipment });
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createShiprocketShipment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ id: orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const result = await createShiprocketShipmentForOrder(order);

    res.status(result.skipped ? 200 : 201).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error creating Shiprocket shipment:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
};

export const updateShipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date().toISOString();

    const shipment = await Shipment.findOneAndUpdate({ id }, updates, { new: true });
    
    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }
    
    res.json({ success: true, shipment });
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
