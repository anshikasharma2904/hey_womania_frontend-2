import express from "express";
import {
  assignAwb,
  cancelShipment,
  createOrder,
  generateInvoice,
  generateLabel,
  getShiprocketAuthStatus,
  loginShiprocket,
  serviceability,
  trackShipment
} from "../controllers/shiprocketController";

const router = express.Router();

router.get("/status", getShiprocketAuthStatus);
router.post("/login", loginShiprocket);
router.get("/serviceability", serviceability);
router.post("/serviceability", serviceability);
router.post("/create-order", createOrder);
router.post("/assign-awb", assignAwb);
router.post("/generate-label", generateLabel);
router.post("/generate-invoice", generateInvoice);
router.get("/track/:awb", trackShipment);
router.post("/cancel", cancelShipment);

export default router;
