require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model("Product", productSchema, "products");
async function fix() {
  const products = await Product.find({ $or: [{ title: /Heywomaniyaa/i }, { description: /Heywomaniyaa/i }] });
  let updatedCount = 0;
  for (const product of products) {
    let updates = {};
    if (product.title && typeof product.title === 'string') {
      const newTitle = product.title.replace(/Heywomaniyaa/gi, "Hey Womaniyaa");
      if (newTitle !== product.title) updates.title = newTitle;
    }
    if (product.description && typeof product.description === 'string') {
      const newDesc = product.description.replace(/Heywomaniyaa/gi, "Hey Womaniyaa");
      if (newDesc !== product.description) updates.description = newDesc;
    }
    if (Object.keys(updates).length > 0) {
      await Product.updateOne({ _id: product._id }, { $set: updates });
      updatedCount++;
      console.log("Updated product:", updates.title || product.title);
    }
  }
  console.log(`Done. Updated ${updatedCount} products.`);
  process.exit(0);
}
fix();
