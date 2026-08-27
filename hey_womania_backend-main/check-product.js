require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model("Product", productSchema, "products");
async function check() {
  const p = await Product.findOne();
  console.log(p.toObject());
  process.exit(0);
}
check();
