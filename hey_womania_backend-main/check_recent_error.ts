import mongoose from "mongoose";
import { Order } from "./models/Order";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const order = await Order.findOne({}).sort({ createdAt: -1 });
  if (order) {
    console.log(`Latest Order: ${order.orderNumber}`);
    console.log(`Shipping Status: ${order.shippingStatus}`);
    console.log(`Shipping Error: ${order.shippingError}`);
  } else {
    console.log("No orders found in the database.");
  }
  mongoose.disconnect();
}
main().catch(console.error);
