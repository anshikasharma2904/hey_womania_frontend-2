const mongoose = require("mongoose");
const { Admin } = require("./models/Admin");
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/heywomania").then(async () => {
  const admin = await Admin.findOne();
  console.log(admin);
  process.exit(0);
});
