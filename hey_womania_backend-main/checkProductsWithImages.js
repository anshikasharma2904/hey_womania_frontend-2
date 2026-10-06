const mongoose = require('mongoose');
const URI = "mongodb+srv://heywomaniyaa_db_user:SMtB9S5CUigQokVG@heywomaniyaa.0iqh78m.mongodb.net/hey_womania?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(URI);

  const db = mongoose.connection.db;
  const productsCollection = db.collection('products');
  const productsWithImages = await productsCollection.find({ "images.0": { $exists: true } }).limit(5).toArray();
  
  if (productsWithImages.length > 0) {
    productsWithImages.forEach(p => {
      console.log(`Product with image: ${p.title} (images: ${p.images.length})`);
    });
  } else {
    console.log("No products with images found in the whole database!");
  }

  process.exit(0);
}

run();
