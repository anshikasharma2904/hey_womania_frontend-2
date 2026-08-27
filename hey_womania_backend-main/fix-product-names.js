require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model("Product", productSchema, "products");

async function fix() {
  const products = await Product.find({});
  let updatedCount = 0;

  for (const product of products) {
    let changed = false;
    
    if (product.title && typeof product.title === 'string') {
      const newTitle = product.title.replace(/Heywomaniyaa/gi, "Hey Womaniyaa");
      if (newTitle !== product.title) {
        product.title = newTitle;
        changed = true;
      }
    }
    
    if (product.description && typeof product.description === 'string') {
      const newDesc = product.description.replace(/Heywomaniyaa/gi, "Hey Womaniyaa");
      if (newDesc !== product.description) {
        product.description = newDesc;
        changed = true;
      }
    }

    if (changed) {
      await product.save();
      updatedCount++;
      console.log("Updated product:", product.title);
    }
  }
  
  console.log(`Done. Updated ${updatedCount} products.`);
  process.exit(0);
}

fix();
