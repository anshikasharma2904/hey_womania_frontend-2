const mongoose = require('mongoose');
const URI = "mongodb+srv://heywomaniyaa_db_user:SMtB9S5CUigQokVG@heywomaniyaa.0iqh78m.mongodb.net/hey_womania?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(URI);

  const db = mongoose.connection.db;
  const productsCollection = db.collection('products');
  const product = await productsCollection.findOne({ title: /Two-Tone Wide Cuff Bracelet/i });
  
  console.log("Product categories:");
  console.log("categoryName:", product.categoryName);
  console.log("categoryId:", product.categoryId);
  console.log("categorySlug:", product.categorySlug);
  console.log("category:", product.category);
  console.log("categories:", product.categories);

  process.exit(0);
}

run();
