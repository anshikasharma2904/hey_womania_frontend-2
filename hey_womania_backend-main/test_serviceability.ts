import mongoose from "mongoose";
import { loginToShiprocket } from "./services/shiprocketService";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const token = await loginToShiprocket();
    
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=122002&delivery_postcode=110001&weight=0.5&cod=1", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    if (data.data?.available_courier_companies?.length > 0) {
        console.log("Sample Courier ETD:", data.data.available_courier_companies[0].etd);
        console.log("Sample Courier Estimated Delivery Days:", data.data.available_courier_companies[0].estimated_delivery_days);
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    mongoose.disconnect();
  }
}
main();
