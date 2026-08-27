require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);
const categorySchema = new mongoose.Schema({}, { strict: false });
const Category = mongoose.model("Category", categorySchema, "categories");
async function fix() {
  const categories = await Category.find({ name: /Heywomaniyaa/i });
  let updatedCount = 0;
  for (const category of categories) {
    if (category.name && typeof category.name === 'string') {
      const newName = category.name.replace(/Heywomaniyaa/gi, "Hey Womaniyaa");
      if (newName !== category.name) {
        await Category.updateOne({ _id: category._id }, { $set: { name: newName } });
        updatedCount++;
        console.log("Updated category:", newName);
      }
    }
  }
  console.log(`Done. Updated ${updatedCount} categories.`);
  process.exit(0);
}
fix();
