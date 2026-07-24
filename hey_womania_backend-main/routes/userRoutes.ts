import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { 
  getMe, 
  updateUserProfile, 
  addUserAddress, 
  removeUserAddress, 
  addUserPaymentMethod, 
  removeUserPaymentMethod 
} from "../controllers/userController";

const router = express.Router();

router.use(requireAuth);

router.get("/me", getMe);
router.post("/profile", updateUserProfile);
router.post("/addresses", addUserAddress);
router.post("/addresses/remove", removeUserAddress);
router.post("/payments", addUserPaymentMethod);
router.post("/payments/remove", removeUserPaymentMethod);

export default router;
