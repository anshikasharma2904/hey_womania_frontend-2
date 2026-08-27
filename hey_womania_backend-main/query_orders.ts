import mongoose from 'mongoose';
import { Order } from './models/Order';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const orders = await Order.find().sort({ createdAt: -1 }).limit(3);
  orders.forEach(o => console.log(`Order ${o.id}: Status: ${o.shippingStatus}, Error: ${o.shippingError}`));
  process.exit(0);
}
run();
