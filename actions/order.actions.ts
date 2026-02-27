"use server";

import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Product model reference
const Product =
  mongoose.models.Product ||
  mongoose.model(
    "Product",
    new mongoose.Schema({
      title: String,
      price: Number,
      images: [String],
      seller: mongoose.Schema.Types.ObjectId,
      stock: Number,
      sold: Number,
      isActive: Boolean,
      productType: String,
      freeShipping: Boolean,
      shippingCost: Number,
    })
  );

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, REFRESH_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
  } catch {
    return null;
  }
}

// ─── Create Order ───
export async function createOrderAction(data: {
  items: Array<{ product: string; quantity: number }>;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    await connectDB();

    const orderItems = [];
    let totalAmount = 0;
    let shippingCost = 0;
    let sellerId = "";

    for (const item of data.items) {
      const product = await Product.findById(item.product);
      if (!product) return { success: false, message: `Product ${item.product} not found` };
      if (!product.isActive) return { success: false, message: `"${product.title}" is unavailable` };
      if (product.productType === "auction") {
        return { success: false, message: `"${product.title}" is an auction item` };
      }
      if (product.stock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for "${product.title}". Available: ${product.stock}`,
        };
      }

      if (!sellerId) sellerId = product.seller.toString();

      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || "",
      });

      totalAmount += product.price * item.quantity;
      if (!product.freeShipping) shippingCost += product.shippingCost || 0;
    }

    const tax = Math.round(totalAmount * 0.08 * 100) / 100;
    const grandTotal = Math.round((totalAmount + shippingCost + tax) * 100) / 100;

    const order = await Order.create({
      buyer: user.userId,
      seller: sellerId,
      items: orderItems,
      totalAmount,
      shippingCost,
      tax,
      grandTotal,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod || "card",
    });

    // Update stock
    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    return {
      success: true,
      message: "Order placed successfully",
      data: JSON.parse(JSON.stringify(order)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return { success: false, message };
  }
}

// ─── Get My Orders (Buyer) ───
export async function getMyOrdersAction(page = 1, limit = 20) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated", data: [] };

    await connectDB();

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ buyer: user.userId })
        .populate("seller", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ buyer: user.userId }),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(orders)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, data: [], message };
  }
}

// ─── Get Seller Orders ───
export async function getSellerOrdersAction(page = 1, limit = 20) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated", data: [] };

    await connectDB();

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ seller: user.userId })
        .populate("buyer", "name avatar email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ seller: user.userId }),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(orders)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, data: [], message };
  }
}

// ─── Get Single Order ───
export async function getOrderByIdAction(orderId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    await connectDB();

    const order = await Order.findById(orderId)
      .populate("buyer", "name avatar email")
      .populate("seller", "name avatar email");

    if (!order) return { success: false, message: "Order not found" };

    if (
      user.role !== "admin" &&
      order.buyer._id.toString() !== user.userId &&
      order.seller._id.toString() !== user.userId
    ) {
      return { success: false, message: "Access denied" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(order)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Cancel Order ───
export async function cancelOrderAction(orderId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (
      order.buyer.toString() !== user.userId &&
      order.seller.toString() !== user.userId
    ) {
      return { success: false, message: "Access denied" };
    }

    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return { success: false, message: "Cannot cancel shipped or delivered order" };
    }

    order.orderStatus = "cancelled";
    order.paymentStatus = "refunded";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    return {
      success: true,
      message: "Order cancelled",
      data: JSON.parse(JSON.stringify(order)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Admin: Get All Orders ───
export async function adminGetAllOrdersAction(page = 1, limit = 100) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, message: "Admin access required", data: [] };
    }

    await connectDB();

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate("buyer", "name email avatar")
        .populate("seller", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(orders)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, data: [], message };
  }
}

// ─── Admin: Update Order Status (Approve / Ship / Deliver) ───
export async function adminUpdateOrderStatusAction(
  orderId: string,
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, message: "Admin access required" };
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) return { success: false, message: "Order not found" };

    order.orderStatus = orderStatus;

    // If confirmed, mark payment as paid (COD approval)
    if (orderStatus === "confirmed") {
      order.paymentStatus = "paid";
    }

    await order.save();

    const updated = await Order.findById(orderId)
      .populate("buyer", "name email avatar")
      .populate("seller", "name email avatar")
      .lean();

    return {
      success: true,
      message: `Order ${orderStatus}`,
      data: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}
