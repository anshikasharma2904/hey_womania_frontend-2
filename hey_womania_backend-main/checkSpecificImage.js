const mongoose = require('mongoose');
const URI = "mongodb+srv://heywomaniyaa_db_user:SMtB9S5CUigQokVG@heywomaniyaa.0iqh78m.mongodb.net/hey_womania?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(URI);

  const db = mongoose.connection.db;
  const productsCollection = db.collection('products');
  const product = await productsCollection.findOne({ title: /Twisted Rope Bangle/i });
  
  if (product) {
    console.log("Product Title:", product.title);
    console.log("Images saved in DB:", product.images);
    console.log("Cloudflare IDs:", product.cloudflareImageIds);
  } else {
    console.log("Product not found.");
  }

  process.exit(0);
}

run();
