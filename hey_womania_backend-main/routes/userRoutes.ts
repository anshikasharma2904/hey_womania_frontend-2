import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { submitKyc, getMyKyc } from "../controllers/kycPayoutController";
import { 
  getMe, 
  updateUserProfile, 
  addUserAddress, 
  removeUserAddress, 
  addUserPaymentMethod, 
  removeUserPaymentMethod,
  upgradeToPartner
} from "../controllers/userController";

const router = express.Router();

router.use(requireAuth);

router.get("/me", getMe);
router.post("/profile", updateUserProfile);
router.post("/addresses", addUserAddress);
router.post("/addresses/remove", removeUserAddress);
router.post("/payments", addUserPaymentMethod);
router.post("/payments/remove", removeUserPaymentMethod);
router.post("/upgrade-partner", upgradeToPartner);

router.post("/kyc", submitKyc);
router.get("/kyc", getMyKyc);

export default router;
