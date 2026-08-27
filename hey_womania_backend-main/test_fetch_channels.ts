import mongoose from "mongoose";
import { loginToShiprocket } from "./services/shiprocketService";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const token = await loginToShiprocket();
    
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/channels", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log("Channels:", JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error("Error fetching channels:", error.message);
  } finally {
    mongoose.disconnect();
  }
}
main();
