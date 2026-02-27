"use server";

import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ─── Product Schema ───
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 5000 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    images: [String],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    condition: { type: String, enum: ["new", "used", "refurbished"], required: true },
    productType: { type: String, enum: ["auction", "buy_now"], default: "buy_now" },
    stock: { type: Number, default: 1, min: 0 },
    sold: { type: Number, default: 0 },
    specifications: { type: Map, of: String, default: {} },
    tags: [String],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    auctionStartPrice: { type: Number, min: 0 },
    auctionCurrentPrice: { type: Number, min: 0 },
    auctionEndTime: Date,
    auctionStatus: { type: String, enum: ["active", "ended", "cancelled"] },
    shippingCost: { type: Number, default: 0 },
    freeShipping: { type: Boolean, default: false },
    shippingInfo: { type: String, default: "" },
    views: { type: Number, default: 0 },
    watchers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// Category model reference
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";

// ─── Helper: Get current user from cookie ───
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

// ─── Get All Products ───
export async function getProductsAction(query: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  condition?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: "asc" | "desc";
}) {
  try {
    await connectDB();

    const {
      page = 1,
      limit = 20,
      search,
      category,
      condition,
      productType,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
    } = query;

    const filter: Record<string, unknown> = { isActive: true };

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (productType) filter.productType = productType;
    if (minPrice || maxPrice) {
      const priceFilter: { $gte?: number; $lte?: number } = {};
      if (minPrice) priceFilter.$gte = minPrice;
      if (maxPrice) priceFilter.$lte = maxPrice;
      filter.price = priceFilter;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .populate("seller", "name avatar")
        .sort({ [sort]: order === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message, data: [] };
  }
}

// ─── Get Single Product ───
export async function getProductByIdAction(id: string) {
  try {
    await connectDB();

    const product = await Product.findById(id)
      .populate("category", "name slug")
      .populate("seller", "name avatar phone");

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Increment views
    await Product.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(product)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Get Product by Slug ───
export async function getProductBySlugAction(slug: string) {
  try {
    await connectDB();

    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .populate("seller", "name avatar phone");

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(product)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Create Product ───
export async function createProductAction(data: {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  category: string;
  condition: "new" | "used" | "refurbished";
  productType?: "auction" | "buy_now";
  stock?: number;
  tags?: string[];
  shippingCost?: number;
  freeShipping?: boolean;
  shippingInfo?: string;
  specifications?: Record<string, string>;
  auctionStartPrice?: number;
  auctionEndTime?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };
    if (user.role !== "seller" && user.role !== "admin") {
      return { success: false, message: "Only sellers can create products" };
    }

    await connectDB();

    const slug =
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();

    const product = await Product.create({
      ...data,
      slug,
      seller: user.userId,
      ...(data.productType === "auction" && {
        auctionCurrentPrice: data.auctionStartPrice || data.price,
        auctionStatus: "active",
      }),
    });

    return {
      success: true,
      message: "Product created successfully",
      data: JSON.parse(JSON.stringify(product)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return { success: false, message };
  }
}

// ─── Update Product ───
export async function updateProductAction(
  productId: string,
  data: Record<string, unknown>
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found" };

    if (user.role !== "admin" && product.seller.toString() !== user.userId) {
      return { success: false, message: "You can only edit your own products" };
    }

    Object.assign(product, data);
    await product.save();

    return {
      success: true,
      message: "Product updated",
      data: JSON.parse(JSON.stringify(product)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return { success: false, message };
  }
}

// ─── Delete Product ───
export async function deleteProductAction(productId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found" };

    if (user.role !== "admin" && product.seller.toString() !== user.userId) {
      return { success: false, message: "You can only delete your own products" };
    }

    await Product.findByIdAndDelete(productId);
    return { success: true, message: "Product deleted" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, message };
  }
}

// ─── Get Featured Products ───
export async function getFeaturedProductsAction(limit = 10) {
  try {
    await connectDB();

    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate("category", "name slug")
      .populate("seller", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, data: [], message };
  }
}

// ─── Get Categories ───
export async function getCategoriesAction() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return { success: false, data: [], message };
  }
}

// ─── Get Seller Products ───
export async function getSellerProductsAction(page = 1, limit = 20) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated", data: [] };

    await connectDB();

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find({ seller: user.userId })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ seller: user.userId }),
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
