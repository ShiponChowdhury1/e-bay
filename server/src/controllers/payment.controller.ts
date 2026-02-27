import { Response, NextFunction } from "express";
import Stripe from "stripe";
import { env } from "../config/env";
import { Order } from "../models/Order";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
export const createCheckoutSession = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      throw new ApiError(400, "Order ID is required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Verify the user owns this order
    if (order.buyer.toString() !== req.user?.userId) {
      throw new ApiError(403, "Not authorized to pay for this order");
    }

    // Check if already paid
    if (order.paymentStatus === "paid") {
      throw new ApiError(400, "Order already paid");
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Add shipping cost if applicable
    if (order.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(order.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add tax if applicable
    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
          },
          unit_amount: Math.round(order.tax * 100),
        },
        quantity: 1,
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${env.CLIENT_URL}/orders/${orderId}?payment=success`,
      cancel_url: `${env.CLIENT_URL}/orders/${orderId}?payment=cancelled`,
      metadata: {
        orderId: orderId,
      },
      customer_email: req.user?.email,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    _next(error);
  }
};

// Create Payment Intent (for Stripe Elements)
export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      throw new ApiError(400, "Order ID is required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.buyer.toString() !== req.user?.userId) {
      throw new ApiError(403, "Not authorized");
    }

    if (order.paymentStatus === "paid") {
      throw new ApiError(400, "Order already paid");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.grandTotal * 100),
      currency: "usd",
      metadata: {
        orderId: orderId,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    _next(error);
  }
};

// Stripe Webhook Handler
export const handleWebhook = async (
  req: AuthRequest,
  res: Response
) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          orderStatus: "confirmed",
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
        });
        console.log(`Order ${orderId} marked as paid`);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          orderStatus: "confirmed",
          stripePaymentIntentId: paymentIntent.id,
        });
        console.log(`Order ${orderId} payment succeeded`);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "failed",
        });
        console.log(`Order ${orderId} payment failed`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Get Stripe publishable key
export const getStripeConfig = async (
  _req: AuthRequest,
  res: Response
) => {
  res.json({
    success: true,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  });
};
