import { loginToShiprocket } from "./services/shiprocketService";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    const token = await loginToShiprocket();
    console.log("Shiprocket auth successful! Token:", token.substring(0, 20) + "...");
  } catch (error) {
    console.error("Shiprocket auth failed:", error);
  }
}
main();
