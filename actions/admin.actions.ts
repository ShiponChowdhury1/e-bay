"use server";

import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
}

// Ensure models exist
function getModels() {
  const User =
    mongoose.models.User ||
    mongoose.model(
      "User",
      new mongoose.Schema({
        name: String,
        email: String,
        role: String,
        avatar: String,
        isBanned: Boolean,
        banReason: String,
        refreshToken: { type: String, select: false },
        phone: String,
        googleId: String,
        isGoogleUser: Boolean,
      }, { timestamps: true })
    );

  const Product =
    mongoose.models.Product ||
    mongoose.model(
      "Product",
      new mongoose.Schema({
        title: String,
        price: Number,
        images: [String],
        seller: mongoose.Schema.Types.ObjectId,
        category: mongoose.Schema.Types.ObjectId,
        isActive: Boolean,
        productType: String,
        auctionStatus: String,
        stock: Number,
        sold: Number,
      }, { timestamps: true })
    );

  const Order =
    mongoose.models.Order ||
    mongoose.model(
      "Order",
      new mongoose.Schema({
        buyer: mongoose.Schema.Types.ObjectId,
        seller: mongoose.Schema.Types.ObjectId,
        grandTotal: Number,
        orderStatus: String,
        paymentStatus: String,
      }, { timestamps: true })
    );

  const Bid =
    mongoose.models.Bid ||
    mongoose.model(
      "Bid",
      new mongoose.Schema({
        product: mongoose.Schema.Types.ObjectId,
        bidder: mongoose.Schema.Types.ObjectId,
        amount: Number,
      }, { timestamps: true })
    );

  const Category =
    mongoose.models.Category ||
    mongoose.model(
      "Category",
      new mongoose.Schema({
        name: { type: String, unique: true },
        slug: { type: String, unique: true },
        description: String,
        image: String,
        parent: mongoose.Schema.Types.ObjectId,
        isActive: { type: Boolean, default: true },
      }, { timestamps: true })
    );

  return { User, Product, Order, Bid, Category };
}

// ─── Get All Users (Admin) ───
export async function adminGetUsersAction(page = 1, limit = 20, role?: string) {
  try {
    await requireAdmin();
    await connectDB();
    const { User } = getModels();

    const skip = (page - 1) * limit;
    const filter: Record<string, string> = {};
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(users)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message, data: [] };
  }
}

// ─── Ban User ───
export async function adminBanUserAction(userId: string, reason: string) {
  try {
    await requireAdmin();
    await connectDB();
    const { User } = getModels();

    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found" };
    if (user.role === "admin") return { success: false, message: "Cannot ban an admin" };

    user.isBanned = true;
    user.banReason = reason;
    user.refreshToken = "";
    await user.save();

    return {
      success: true,
      message: "User banned successfully",
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Unban User ───
export async function adminUnbanUserAction(userId: string) {
  try {
    await requireAdmin();
    await connectDB();
    const { User } = getModels();

    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: false, banReason: "" },
      { new: true }
    );
    if (!user) return { success: false, message: "User not found" };

    return {
      success: true,
      message: "User unbanned",
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Change User Role ───
export async function adminChangeRoleAction(
  userId: string,
  role: "admin" | "seller" | "buyer"
) {
  try {
    await requireAdmin();
    await connectDB();
    const { User } = getModels();

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) return { success: false, message: "User not found" };

    return {
      success: true,
      message: "Role updated",
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Get Platform Statistics ───
export async function adminGetStatsAction() {
  try {
    await requireAdmin();
    await connectDB();
    const { User, Product, Order, Bid } = getModels();

    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalProducts,
      totalOrders,
      totalBids,
      activeAuctions,
      bannedUsers,
      salesAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "buyer" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Bid.countDocuments(),
      Product.countDocuments({ productType: "auction", auctionStatus: "active" }),
      User.countDocuments({ isBanned: true }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, totalSales: { $sum: "$grandTotal" }, totalOrders: { $sum: 1 } } },
      ]),
    ]);

    const sales = salesAgg[0] || { totalSales: 0, totalOrders: 0 };

    const monthlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return {
      success: true,
      data: {
        users: { total: totalUsers, sellers: totalSellers, buyers: totalBuyers, banned: bannedUsers },
        products: { total: totalProducts, activeAuctions },
        orders: { total: totalOrders, paid: sales.totalOrders },
        bids: { total: totalBids },
        revenue: { totalSales: sales.totalSales },
        monthlySales: JSON.parse(JSON.stringify(monthlySales)),
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Admin Get All Products ───
export async function adminGetProductsAction(page = 1, limit = 20) {
  try {
    await requireAdmin();
    await connectDB();
    const { Product } = getModels();

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .populate("category", "name slug")
        .populate("seller", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, data: [], message };
  }
}

// ─── Toggle Product Status ───
export async function adminToggleProductAction(productId: string) {
  try {
    await requireAdmin();
    await connectDB();
    const { Product } = getModels();

    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found" };

    product.isActive = !product.isActive;
    await product.save();

    return {
      success: true,
      message: `Product ${product.isActive ? "activated" : "deactivated"}`,
      data: JSON.parse(JSON.stringify(product)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Category Management ───
export async function adminCreateCategoryAction(data: {
  name: string;
  description?: string;
  image?: string;
  parent?: string;
}) {
  try {
    await requireAdmin();
    await connectDB();
    const { Category } = getModels();

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await Category.create({ ...data, slug });

    return {
      success: true,
      message: "Category created",
      data: JSON.parse(JSON.stringify(category)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

export async function adminGetCategoriesAction() {
  try {
    await connectDB();
    const { Category } = getModels();

    const categories = await Category.find().sort({ name: 1 }).lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, data: [], message };
  }
}

export async function adminUpdateCategoryAction(
  id: string,
  data: { name?: string; description?: string; image?: string; isActive?: boolean }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { Category } = getModels();

    const updateData: Record<string, unknown> = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!category) return { success: false, message: "Category not found" };

    return {
      success: true,
      message: "Category updated",
      data: JSON.parse(JSON.stringify(category)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

export async function adminDeleteCategoryAction(id: string) {
  try {
    await requireAdmin();
    await connectDB();
    const { Category, Product } = getModels();

    const count = await Product.countDocuments({ category: id });
    if (count > 0) {
      return { success: false, message: `Cannot delete: ${count} products use this category` };
    }

    await Category.findByIdAndDelete(id);
    return { success: true, message: "Category deleted" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}
