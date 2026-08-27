import mongoose from "mongoose";
import { loginToShiprocket } from "./services/shiprocketService";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const token = await loginToShiprocket();
    
    const payload = {
      "order_id": "TEST-MANUAL-104",
      "order_date": new Date().toISOString().slice(0, 10),
      "pickup_location": "warehouse",
      "channel_id": 11963870,
      "billing_customer_name": "Ankit",
      "billing_last_name": "Test",
      "billing_address": "Test Street 123",
      "billing_city": "Delhi",
      "billing_pincode": "110001",
      "billing_state": "Delhi",
      "billing_country": "India",
      "billing_email": "test@example.com",
      "billing_phone": "9876543210",
      "shipping_is_billing": true,
      "order_items": [
        {
          "name": "Test Product",
          "sku": "TEST-001",
          "units": 1,
          "selling_price": 500
        }
      ],
      "payment_method": "Prepaid",
      "sub_total": 500,
      "length": 10,
      "breadth": 10,
      "height": 10,
      "weight": 0.5
    };

    console.log("Calling Shiprocket Create Order...");
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log("Create Order Response:", JSON.stringify(data, null, 2));

    if (data.order_id) {
      console.log("Checking if order exists...");
      const checkRes = await fetch(`https://apiv2.shiprocket.in/v1/external/orders/show/${data.order_id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const checkData = await checkRes.json();
      console.log("Check Order Response:", JSON.stringify(checkData, null, 2));
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    mongoose.disconnect();
  }
}
main();
