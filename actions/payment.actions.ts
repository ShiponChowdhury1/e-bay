"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Get auth token from cookies
async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

// ─── Create Stripe Checkout Session ───
export async function createStripeCheckoutAction(orderId: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const res = await fetch(`${API_URL}/payments/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Failed to create checkout session" };
    }

    return {
      success: true,
      sessionId: data.sessionId,
      url: data.url,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Create Payment Intent (for Stripe Elements) ───
export async function createPaymentIntentAction(orderId: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const res = await fetch(`${API_URL}/payments/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Failed to create payment intent" };
    }

    return {
      success: true,
      clientSecret: data.clientSecret,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Get Stripe Config ───
export async function getStripeConfigAction() {
  try {
    const res = await fetch(`${API_URL}/payments/config`);
    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: "Failed to get Stripe config" };
    }

    return {
      success: true,
      publishableKey: data.publishableKey,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}
