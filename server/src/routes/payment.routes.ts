import { Router } from "express";
import express from "express";
import {
  createCheckoutSession,
  createPaymentIntent,
  handleWebhook,
  getStripeConfig,
} from "../controllers/payment.controller";
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router();

// Public - get Stripe publishable key
router.get("/config", getStripeConfig);

// Webhook - raw body required (no JSON parsing)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Protected routes
router.post("/create-checkout-session", verifyJWT, createCheckoutSession);
router.post("/create-payment-intent", verifyJWT, createPaymentIntent);

export default router;
