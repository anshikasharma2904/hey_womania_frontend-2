import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

// Routes
import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";
import partnerRoutes from "./routes/partnerRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import phoneVerificationRoutes from "./routes/phoneVerificationRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import zohoRoutes from "./routes/zohoRoutes";
import shiprocketRoutes from "./routes/shiprocketRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import { shiprocketWebhook } from "./controllers/shiprocketController";

dotenv.config(); // Load backend/.env

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database connection
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/phone-verification", phoneVerificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/zoho", zohoRoutes);
app.use("/api/shiprocket", shiprocketRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.post("/api/webhooks/shiprocket", shiprocketWebhook);

// Root
app.get("/", (req, res) => {
  res.send("Women Style Backend API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
