import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/heywomania");
  const user = await mongoose.connection.collection("users").findOne({ email: "test3@test.com" });
  console.log(JSON.stringify(user, null, 2));
  process.exit(0);
}
run();
