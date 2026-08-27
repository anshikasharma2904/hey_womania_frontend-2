import mongoose from "mongoose";
import { Product } from "./models/Product";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const products = await Product.find({}).limit(5);
  console.log(`Found ${products.length} products.`);
  for (const p of products) {
    console.log(`Product: ${p.title}`);
    for (const v of p.variants) {
      console.log(`  - Variant SKU: ${v.sku}, Stock: ${v.availableStock}`);
    }
  }
  mongoose.disconnect();
}
main().catch(console.error);
