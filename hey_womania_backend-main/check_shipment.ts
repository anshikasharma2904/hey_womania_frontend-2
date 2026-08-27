import mongoose from "mongoose";
import { Order } from "./models/Order";
import { Shipment } from "./models/Shipment";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const order = await Order.findOne({}).sort({ createdAt: -1 });
  if (order) {
    console.log(`Latest Order: ${order.orderNumber}`);
    const shipment = await Shipment.findOne({ orderId: order.id });
    if (shipment) {
      console.log(`Shipment ID: ${shipment.id}`);
      console.log(`Shiprocket Order ID: ${shipment.shiprocketOrderId}`);
      console.log(`Shiprocket Payload: ${JSON.stringify(shipment.shiprocketPayload, null, 2)}`);
    } else {
      console.log("No shipment found for this order.");
    }
  }
  mongoose.disconnect();
}
main().catch(console.error);
