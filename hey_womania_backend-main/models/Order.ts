import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  id: String,
  userId: String,
  orderNumber: String,
  date: String,
  total: String,
  sellPoints: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: [
      "Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", 
      "Delivered", "Cancelled", "Return Requested", "Returned", "Refunded"
    ],
    default: "Pending"
  },
  statusText: String,
  trackingId: String,
  invoiceUrl: String,
  shippingProvider: String,
  shippingStatus: String,
  shippingError: String,
  shiprocketOrderId: String,
  shiprocketShipmentId: String,
  shipmentId: String,
  awb: String,
  courier: String,
  trackingUrl: String,
  shipmentStatus: String,
  activeStep: Number,
  paymentMethod: String,
  paymentStatus: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  address: {
    name: String,
    fullName: String,
    street: String,
    streetAddress: String,
    streetAddressLine2: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
  },
  items: [{
    productId: String,
    sku: String,
    name: String,
    qty: Number,
    price: String,
    img: String,
    sellPoints: { type: Number, default: 0 }
  }],
  createdAt: String,
}, { collection: "orders" });

export const Order = mongoose.model("Order", orderSchema);
