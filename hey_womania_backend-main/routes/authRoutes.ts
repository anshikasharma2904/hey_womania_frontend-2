import express from "express";
import { register, login, loginOtp, adminLogin, logout, forgotPassword, verifyOtp, resetPassword, forgotPasswordPhone, verifyOtpPhone, resetPasswordPhone } from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/login-otp", loginOtp);
router.post("/admin-login", adminLogin);
router.post("/logout", logout);

// Email-based password reset
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Phone-based password reset (for users without email)
router.post("/forgot-password-phone", forgotPasswordPhone);
router.post("/verify-otp-phone", verifyOtpPhone);
router.post("/reset-password-phone", resetPasswordPhone);

export default router;
