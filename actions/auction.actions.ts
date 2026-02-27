"use server";

import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ─── Bid Schema ───
const bidSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    isHighest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Bid = mongoose.models.Bid || mongoose.model("Bid", bidSchema);

// Product model reference
const productSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    description: String,
    price: Number,
    images: [String],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    condition: String,
    productType: { type: String, enum: ["auction", "buy_now"] },
    stock: Number,
    isActive: { type: Boolean, default: true },
    auctionStartPrice: Number,
    auctionCurrentPrice: Number,
    auctionEndTime: Date,
    auctionStatus: { type: String, enum: ["active", "ended", "cancelled"] },
    shippingCost: Number,
    freeShipping: Boolean,
    shippingInfo: String,
    views: Number,
    watchers: Number,
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

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

// ─── Place Bid ───
export async function placeBidAction(productId: string, amount: number) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found" };

    if (product.productType !== "auction") {
      return { success: false, message: "This product is not an auction item" };
    }

    if (product.auctionStatus !== "active") {
      return { success: false, message: "This auction has ended" };
    }

    if (product.auctionEndTime && new Date() > product.auctionEndTime) {
      await Product.findByIdAndUpdate(productId, { auctionStatus: "ended" });
      return { success: false, message: "This auction has ended" };
    }

    if (product.seller.toString() === user.userId) {
      return { success: false, message: "You cannot bid on your own product" };
    }

    const currentPrice =
      product.auctionCurrentPrice || product.auctionStartPrice || product.price;

    if (amount <= currentPrice) {
      return {
        success: false,
        message: `Bid must be higher than current price of $${currentPrice}`,
      };
    }

    // Reset previous highest bid
    await Bid.updateMany(
      { product: productId, isHighest: true },
      { isHighest: false }
    );

    // Create new bid
    const bid = await Bid.create({
      product: productId,
      bidder: user.userId,
      amount,
      isHighest: true,
    });

    // Update product current price
    await Product.findByIdAndUpdate(productId, {
      auctionCurrentPrice: amount,
    });

    return {
      success: true,
      message: "Bid placed successfully",
      data: JSON.parse(JSON.stringify(bid)),
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to place bid" };
  }
}

// ─── Get Bid History ───
export async function getBidHistoryAction(
  productId: string,
  page = 1,
  limit = 20
) {
  try {
    await connectDB();

    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      Bid.find({ product: productId })
        .populate("bidder", "name avatar")
        .sort({ amount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bid.countDocuments({ product: productId }),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(bids)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}

// ─── Get Active Auctions ───
export async function getActiveAuctionsAction(page = 1, limit = 20) {
  try {
    await connectDB();

    const skip = (page - 1) * limit;

    const filter = {
      productType: "auction",
      auctionStatus: "active",
      isActive: true,
      auctionEndTime: { $gt: new Date() },
    };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .populate("seller", "name avatar")
        .sort({ auctionEndTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}

// ─── Get My Bids ───
export async function getMyBidsAction(page = 1, limit = 20) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated", data: [] };

    await connectDB();

    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      Bid.find({ bidder: user.userId })
        .populate({
          path: "product",
          select:
            "title slug images auctionCurrentPrice auctionEndTime auctionStatus price",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bid.countDocuments({ bidder: user.userId }),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(bids)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}
