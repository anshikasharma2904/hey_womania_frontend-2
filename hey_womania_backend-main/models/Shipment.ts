import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  courierPartner: { type: String, default: "Manual" },
  shiprocketOrderId: String,
  shiprocketShipmentId: String,
  shiprocketStatus: String,
  shiprocketPayload: mongoose.Schema.Types.Mixed,
  lastError: String,
  awbNumber: String,
  courierName: String,
  trackingUrl: String,
  labelUrl: String,
  shipmentStatus: { type: String, default: "Pending Pickup" },
  pickupAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  deliveryAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  shippingCharge: { type: Number, default: 0 },
  codCharge: { type: Number, default: 0 },
  createdAt: String,
  updatedAt: String,
}, { collection: "shipments" });

export const Shipment = mongoose.model("Shipment", shipmentSchema);
