const mongoose = require("mongoose");
require("dotenv").config();
const { Product } = require("./models/Product.ts"); // Might fail if it's TS, let's just use raw mongoose

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/heywomaniya");
  
  const db = mongoose.connection.db;
  const products = await db.collection("products").find({}).toArray();
  
  for (const p of products) {
    const roundedPrice = Math.round(p.price || 0);
    const roundedSalePrice = Math.round(p.salePrice || 0);
    
    // Also round the sizes array price and salePrice if they exist
    let sizesChanged = false;
    if (p.sizes && Array.isArray(p.sizes)) {
      p.sizes.forEach(sz => {
        if (sz.price !== undefined) {
           sz.price = Math.round(sz.price);
           sizesChanged = true;
        }
        if (sz.salePrice !== undefined) {
           sz.salePrice = Math.round(sz.salePrice);
           sizesChanged = true;
        }
      });
    }

    const updates = { 
        price: roundedPrice, 
        salePrice: roundedSalePrice,
        sellPoints: Math.round(roundedSalePrice / 5) // ensure sellpoints is also updated? The schema is `sellPoints: Number((salePrice / 5).toFixed(2))`
    };
    if (sizesChanged) updates.sizes = p.sizes;

    await db.collection("products").updateOne({ _id: p._id }, { $set: updates });
  }
  
  console.log(`Updated ${products.length} products to use rounded prices.`);
  process.exit(0);
}

run().catch(console.error);
