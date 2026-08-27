import mongoose from "mongoose";
import { loginToShiprocket } from "./services/shiprocketService";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const token = await loginToShiprocket();
    
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders?per_page=10", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log("Fetched Orders Count:", data.data?.length || 0);
    if (data.data && data.data.length > 0) {
      console.log("First Order ID:", data.data[0].id);
      console.log("First Order Channel Order ID:", data.data[0].channel_order_id);
      console.log("First Order Status:", data.data[0].status);
      console.log("Customer:", data.data[0].customer_name);
    }
  } catch (error: any) {
    console.error("Error fetching orders:", error.message);
  } finally {
    mongoose.disconnect();
  }
}
main();
