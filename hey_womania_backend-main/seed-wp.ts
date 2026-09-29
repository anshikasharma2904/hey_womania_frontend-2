import mongoose from "mongoose";
import { User } from "./models/User";
import { Order } from "./models/Order";
import { PartnerDashboard } from "./models/PartnerDashboard";
import { getClosingPreview } from "./controllers/closingController";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/heywomania";

function getPrevMonth(monthStr: string, subtractMonths = 0): string {
  let [year, month] = monthStr.split("-").map(Number);
  month -= subtractMonths;
  while (month <= 0) {
    month += 12;
    year -= 1;
  }
  return `${year}-${month.toString().padStart(2, '0')}`;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  // Clear previous test users and orders
  await User.deleteMany({ email: { $regex: /womaniyaa_test/ } });
  await Order.deleteMany({ "address.street": "WP Test Street" });

  const rootId = crypto.randomUUID();
  await User.create({
    id: rootId,
    name: "WP Test Root",
    firstName: "WP",
    lastName: "Root",
    email: "root@womaniyaa_test.com",
    phone: `99${Math.floor(Math.random() * 100000000)}`,
    role: "partner",
    partnerProfile: {
      kycStatus: "Approved",
      walletBalance: 0,
      networkWalletBalance: 0,
      womaniyaaPoints: [],
      superWomaniyaaPoints: []
    }
  });

  const currentMonthStr = "2026-06"; // We'll test up to this month

  // Create massive orders for Root over the last 6 months
  // For Super Womaniyaa Point, need 25,000 self sales and 2.5Cr team sales.
  // We'll give the root user 2.6Cr self sales (which counts as team sales) each month for 6 months!
  for (let i = 0; i < 6; i++) {
    const month = getPrevMonth(currentMonthStr, i);
    
    await Order.create({
      id: crypto.randomUUID(),
      userId: rootId,
      orderNumber: `WP-ORD-${month}`,
      createdAt: `${month}-15T10:00:00Z`,
      total: "₹2,60,00,000",
      status: "Delivered",
      statusText: "Delivered",
      paymentMethod: "cod",
      items: [{
        quantity: 1,
        price: "₹2,60,00,000",
        name: "Massive Wholesale Package"
      }],
      address: {
        street: "WP Test Street",
        city: "Test",
        phone: "9999999991"
      }
    });
  }
  console.log("Seeded 6 months of 2.6Cr orders for Root.");

  // Mock Request/Response for preview
  const req = { query: { month: currentMonthStr } } as any;
  let responseData: any = null;
  const res = {
    json: (data: any) => { responseData = data; },
    status: () => res
  } as any;

  console.log(`Running closing preview for ${currentMonthStr}...`);
  await getClosingPreview(req, res);

  const rootPreview = responseData.partnerPreviews.find((p: any) => p.userId === rootId);
  console.log("Closing Preview Result for Root:");
  console.log(`- Team Sales this month: ₹${rootPreview.teamSales.toLocaleString('en-IN')}`);
  console.log(`- Newly Qualified WP: ${rootPreview.newlyQualifiedWP}`);
  console.log(`- Newly Qualified Super WP: ${rootPreview.newlyQualifiedSWP}`);
  
  await mongoose.disconnect();
}

run().catch(console.error);
