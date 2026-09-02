import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db";
import { Order } from "./models/Order";

const run = async () => {
  await connectDB();
  const orders = await Order.find({ status: { $nin: ["Cancelled", "Returned", "Refunded", "Return Requested"] } }).limit(5);
  console.log("Orders count:", orders.length);
  if (orders.length > 0) {
    console.log("Sample order:", orders[0].createdAt, orders[0].status, orders[0].total);
  }
  process.exit(0);
};
run();
