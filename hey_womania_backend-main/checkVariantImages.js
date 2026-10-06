const mongoose = require('mongoose');
const URI = "mongodb+srv://heywomaniyaa_db_user:SMtB9S5CUigQokVG@heywomaniyaa.0iqh78m.mongodb.net/hey_womania?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(URI);

  const db = mongoose.connection.db;
  const productsCollection = db.collection('products');
  const productsWithVariantImagesButNoMainImages = await productsCollection.find({
    $and: [
      { $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] },
      { "variants.images.0": { $exists: true } }
    ]
  }).limit(5).toArray();
  
  if (productsWithVariantImagesButNoMainImages.length > 0) {
    productsWithVariantImagesButNoMainImages.forEach(p => {
      console.log(`Product with variant image: ${p.title}`);
    });
  } else {
    console.log("No products found with variant images but no main images.");
  }

  process.exit(0);
}

run();
