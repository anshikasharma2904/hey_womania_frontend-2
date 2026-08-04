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
import {
  getZohoInventoryStatus,
  getZohoRateLimitInfo,
  syncZohoCategoriesToDb,
  syncZohoItemsToProducts
} from "./services/zohoInventoryService";

dotenv.config(); // Load backend/.env

const app = express();
const PORT = process.env.PORT || 5000;
const ZOHO_AUTO_SYNC_ENABLED = process.env.ZOHO_AUTO_SYNC_ENABLED !== "false";
const ZOHO_AUTO_SYNC_INTERVAL_MINUTES = Math.max(
  5,
  Number(process.env.ZOHO_AUTO_SYNC_INTERVAL_MINUTES || 30) || 30
);
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://heywomaniyaa.com",
  "https://www.heywomaniyaa.com",
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_FRONTEND_URL
].filter(Boolean) as string[];
let zohoAutoSyncInProgress = false;

async function runZohoAutoSync(trigger: "startup" | "interval") {
  if (!ZOHO_AUTO_SYNC_ENABLED) {
    return;
  }

  if (zohoAutoSyncInProgress) {
    console.log(`[Zoho Auto Sync] Skipping ${trigger} run because a sync is already in progress.`);
    return;
  }

  const zohoStatus = getZohoInventoryStatus();
  if (!zohoStatus.configured) {
    console.log("[Zoho Auto Sync] Skipping sync because Zoho is not configured.");
    return;
  }

  zohoAutoSyncInProgress = true;

  try {
    const rateLimit = getZohoRateLimitInfo();
    if (rateLimit.isExceeded) {
      console.log(`[Zoho Auto Sync] Skipping ${trigger} sync: Cooldown active (${rateLimit.cooldownRemainingSeconds}s remaining).`);
      return;
    }

    console.log(`[Zoho Auto Sync] Starting ${trigger} sync...`);
    const categoryResult = await syncZohoCategoriesToDb();
    const productResult = await syncZohoItemsToProducts();

    console.log(
      `[Zoho Auto Sync] Completed ${trigger} sync. Categories: ${categoryResult.synced}, Products: ${productResult.synced}`
    );
  } catch (error: any) {
    console.warn(`[Zoho Auto Sync] ${trigger} sync paused:`, error.message || error);
  } finally {
    zohoAutoSyncInProgress = false;
  }
}

function startZohoAutoSync() {
  if (!ZOHO_AUTO_SYNC_ENABLED) {
    console.log("[Zoho Auto Sync] Disabled via ZOHO_AUTO_SYNC_ENABLED=false");
    return;
  }

  const intervalMs = ZOHO_AUTO_SYNC_INTERVAL_MINUTES * 60 * 1000;
  console.log(
    `[Zoho Auto Sync] Enabled. Products will sync every ${ZOHO_AUTO_SYNC_INTERVAL_MINUTES} minutes.`
  );

  void runZohoAutoSync("startup");
  setInterval(() => {
    void runZohoAutoSync("interval");
  }, intervalMs);
}

// Middlewares
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
async function bootstrap() {
  await connectDB();
  startZohoAutoSync();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

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

void bootstrap();
