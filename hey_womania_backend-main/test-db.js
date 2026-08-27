require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model("Product", productSchema, "products");
async function run() {
  const p = await Product.find({ title: /Heywomaniyaa/i }).select('title').limit(5);
  console.log(p);
  process.exit(0);
}
run();
