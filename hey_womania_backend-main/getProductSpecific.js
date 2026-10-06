const mongoose = require('mongoose');
const URI = "mongodb+srv://heywomaniyaa_db_user:SMtB9S5CUigQokVG@heywomaniyaa.0iqh78m.mongodb.net/hey_womania?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const productsCollection = db.collection('products');
  const products = await productsCollection.find({ title: /Two-Tone Wide Cuff Bracelet/i }).toArray();
  
  products.forEach(p => {
    console.log(`Product: ${p.title}`);
    console.log(`Images:`, p.images);
    console.log(`CloudflareImageIds:`, p.cloudflareImageIds);
  });

  process.exit(0);
}

run();
