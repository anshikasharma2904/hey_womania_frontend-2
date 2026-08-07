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

dotenv.config(); // Load .env
dotenv.config({ path: "env" }); // Load env (without dot fallback)
dotenv.config({ path: "../.env" });

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
let zohoSyncTimeout: NodeJS.Timeout | null = null;

function getMsUntilNextIST1230(): number {
  const now = new Date();

  // Format current date in IST time zone
  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  });

  const parts = istFormatter.formatToParts(now);
  let year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0;
  for (const p of parts) {
    if (p.type === "year") year = parseInt(p.value, 10);
    if (p.type === "month") month = parseInt(p.value, 10) - 1;
    if (p.type === "day") day = parseInt(p.value, 10);
    if (p.type === "hour") hour = parseInt(p.value, 10);
    if (p.type === "minute") minute = parseInt(p.value, 10);
    if (p.type === "second") second = parseInt(p.value, 10);
  }

  // 12:30 PM IST corresponds to 07:00:00 AM UTC (12:30 - 5:30 = 07:00)
  const targetUTC = new Date(Date.UTC(year, month, day, 7, 0, 0, 0));

  // If 12:30 PM IST today has already passed, schedule for 12:30 PM IST tomorrow
  if (now.getTime() >= targetUTC.getTime()) {
    targetUTC.setUTCDate(targetUTC.getUTCDate() + 1);
  }

  return targetUTC.getTime() - now.getTime();
}

async function runZohoAutoSync(trigger: string) {
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

    console.log(`[Zoho Auto Sync] Starting daily 12:30 PM IST sync...`);
    const categoryResult = await syncZohoCategoriesToDb();
    const productResult = await syncZohoItemsToProducts();

    console.log(
      `[Zoho Auto Sync] Completed daily sync. Categories: ${categoryResult.synced}, Products: ${productResult.synced}`
    );
  } catch (error: any) {
    console.warn(`[Zoho Auto Sync] Daily sync paused:`, error.message || error);
  } finally {
    zohoAutoSyncInProgress = false;
  }
}

function startZohoAutoSync() {
  if (!ZOHO_AUTO_SYNC_ENABLED) {
    console.log("[Zoho Auto Sync] Disabled via ZOHO_AUTO_SYNC_ENABLED=false");
    return;
  }

  if (zohoSyncTimeout) {
    clearTimeout(zohoSyncTimeout);
  }

  const delayMs = getMsUntilNextIST1230();
  const nextRunDate = new Date(Date.now() + delayMs);
  const nextRunIST = nextRunDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  console.log(
    `[Zoho Auto Sync] Enabled (Once a day at 12:30 PM IST). Next scheduled run: ${nextRunIST} IST.`
  );

  zohoSyncTimeout = setTimeout(() => {
    void runZohoAutoSync("daily_1230pm_ist");
    // Schedule for next day
    startZohoAutoSync();
  }, delayMs);
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
