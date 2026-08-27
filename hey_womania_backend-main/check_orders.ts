import mongoose from "mongoose";
import { Order } from "./models/Order";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
  console.log(`Found ${orders.length} total orders.`);
  for(let o of orders) {
    console.log(`Order: ${o.orderNumber}, ID: ${o.id}`);
  }
  mongoose.disconnect();
}
main().catch(console.error);
