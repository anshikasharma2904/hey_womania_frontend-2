import mongoose from "mongoose";
import { Order } from "./models/Order";
import { createShiprocketOrder } from "./services/shiprocketService";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Override channel ID to undefined to see if it works
process.env.SHIPROCKET_CHANNEL_ID = ""; 

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const orderId = crypto.randomUUID();
  const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date().toISOString();

  const newOrder = new Order({
    id: orderId,
    userId: "guest-user",
    orderNumber,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    total: "₹1,000",
    status: "Pending",
    statusText: "We are processing your order",
    activeStep: 1,
    paymentMethod: "cod",
    paymentStatus: "COD",
    address: {
        name: "Test Customer",
        street: "Test Street 123",
        city: "Gurgaon",
        state: "Haryana",
        pincode: "122002",
        phone: "9876543210",
        email: "test@example.com"
    },
    items: [{
      productId: "test-prod-1",
      sku: "HEYMBF-L",
      name: "Test Product",
      qty: 1,
      price: "1000",
      img: ""
    }],
    createdAt: now
  });

  await newOrder.save();
  try {
    const result = await createShiprocketOrder(newOrder);
    console.log("Shiprocket Result:", JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error("Shiprocket error:", err.message);
  }

  mongoose.disconnect();
}
main().catch(console.error);
