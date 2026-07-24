import mongoose from "mongoose";
import { Admin } from "./models/Admin";
import { hashPassword } from "./utils/authHelpers";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/heywomania";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    const adminEmail = "admin@heywomania.com";
    const adminPassword = "admin"; // They can change this later

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists in the Admin collection.");
      process.exit(0);
    }

    const passwordHash = await hashPassword(adminPassword);
    const now = new Date().toISOString();

    const newAdmin = new Admin({
      id: crypto.randomUUID(),
      name: "Super Admin",
      email: adminEmail,
      passwordHash,
      role: "superadmin",
      createdAt: now,
      updatedAt: now
    });

    await newAdmin.save();
    console.log("Admin user created successfully in the Admin collection!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
