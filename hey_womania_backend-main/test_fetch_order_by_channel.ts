import mongoose from "mongoose";
import { loginToShiprocket } from "./services/shiprocketService";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const token = await loginToShiprocket();
    
    // Attempt searching by channel_order_id
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders?channel_order_id=459970", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log("Order Data via channel_order_id:", JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error("Error fetching order:", error.message);
  } finally {
    mongoose.disconnect();
  }
}
main();
