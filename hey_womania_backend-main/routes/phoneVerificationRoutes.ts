import express from "express";
import { startVerification, checkVerification } from "../controllers/phoneVerificationController";

const router = express.Router();

router.post("/start", startVerification);
router.post("/check", checkVerification);

export default router;
