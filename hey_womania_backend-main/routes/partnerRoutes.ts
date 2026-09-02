import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { getPartnerDashboard, updatePartnerDashboard, getPartnerIncomeLedgers, getPartnerReferrals } from "../controllers/partnerDashboardController";
import { getNetworkTree, getNetworkOrders } from "../controllers/networkController";

const router = express.Router();

router.use(requireAuth);

router.get("/dashboard", getPartnerDashboard);
router.patch("/dashboard", updatePartnerDashboard);
router.get("/ledgers", getPartnerIncomeLedgers);
router.get("/referrals", getPartnerReferrals);
router.get("/network", getNetworkTree);
router.get("/network-orders", getNetworkOrders);

export default router;
