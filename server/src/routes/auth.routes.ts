import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyJWT } from "../middleware/verifyJWT";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/auth.validator";

const router = Router();

// Public routes
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  AuthController.login
);

router.post("/google", authLimiter, AuthController.googleAuth);
router.post("/refresh-token", AuthController.refreshToken);

// OTP routes (public)
router.post(
  "/verify-otp",
  authLimiter,
  validate(verifyOtpSchema),
  AuthController.verifyOtp
);

router.post(
  "/send-otp",
  authLimiter,
  validate(resendOtpSchema),
  AuthController.sendOtp
);

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

// Protected routes
router.post("/logout", verifyJWT, AuthController.logout);
router.get("/profile", verifyJWT, AuthController.getProfile);
router.put(
  "/profile",
  verifyJWT,
  validate(updateProfileSchema),
  AuthController.updateProfile
);

router.post(
  "/change-password",
  verifyJWT,
  validate(changePasswordSchema),
  AuthController.changePassword
);

export default router;
