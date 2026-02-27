"use server";

import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";

// ─── Order Schema ───
const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    shippingAddress: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    paymentMethod: { type: String, enum: ["card", "cod"], default: "card" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    stripeSessionId: String,
    stripePaymentIntentId: String,
    totalAmount: Number,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// ─── Get User from Token ───
async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// ─── Create Stripe Checkout Session ───
export async function createStripeCheckoutAction(orderId: string) {
  try {
    await connectDB();
    
    const userId = await getUserFromToken();
    if (!userId) {
      return { success: false, message: "Not authenticated" };
    }

    const order = await Order.findOne({ _id: orderId, buyer: userId });
    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: order.items.map((item: { title: string; price: number; quantity: number; image?: string }) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${orderId}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${orderId}?payment=cancelled`,
      metadata: {
        orderId: orderId,
        userId: userId,
      },
    });

    // Save session ID to order
    order.stripeSessionId = session.id;
    await order.save();

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Create Payment Intent (for Stripe Elements) ───
export async function createPaymentIntentAction(orderId: string) {
  try {
    await connectDB();
    
    const userId = await getUserFromToken();
    if (!userId) {
      return { success: false, message: "Not authenticated" };
    }

    const order = await Order.findOne({ _id: orderId, buyer: userId });
    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Calculate total
    const total = order.items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // cents
      currency: "usd",
      metadata: {
        orderId: orderId,
        userId: userId,
      },
    });

    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error: unknown) {
    console.error("Payment intent error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Verify Payment (called after successful payment) ───
export async function verifyPaymentAction(sessionId: string) {
  try {
    await connectDB();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Update order status
      await Order.findOneAndUpdate(
        { stripeSessionId: sessionId },
        { paymentStatus: "paid", status: "processing" }
      );

      return { success: true, message: "Payment verified" };
    }

    return { success: false, message: "Payment not completed" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Get Stripe Config ───
export async function getStripeConfigAction() {
  return {
    success: true,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };
}
