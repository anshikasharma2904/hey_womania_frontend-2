import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Product } from "./models/Product";

async function checkDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  const products = await Product.find({});
  console.log(`Total products in DB right now: ${products.length}`);
  for (const p of products) {
    console.log(`- Title: "${p.title}" | slug: ${p.slug} | zohoGroupId: "${p.zohoGroupId}" | zohoItemId: "${p.zohoItemId}" | variants count: ${p.variants?.length || 0}`);
  }

  await mongoose.disconnect();
}

checkDb().catch(console.error);
