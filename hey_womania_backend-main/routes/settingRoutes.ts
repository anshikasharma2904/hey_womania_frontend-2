import { Router } from "express";
import { getSettings } from "../controllers/settingController";

const router = Router();

// Public route to get settings (used by frontend homepage)
router.get("/", getSettings);

export default router;
