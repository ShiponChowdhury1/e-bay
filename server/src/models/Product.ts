import mongoose, { Document, Schema, Model } from "mongoose";
import { ProductType, ProductCondition } from "../types";

// ─── Interface ───
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  condition: ProductCondition;
  productType: ProductType;
  stock: number;
  sold: number;
  specifications: Map<string, string>;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  // Auction fields
  auctionStartPrice?: number;
  auctionCurrentPrice?: number;
  auctionEndTime?: Date;
  auctionStatus?: "active" | "ended" | "cancelled";
  // Shipping
  shippingCost: number;
  freeShipping: boolean;
  shippingInfo: string;
  // Stats
  views: number;
  watchers: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───
const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: "Maximum 10 images allowed",
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
    condition: {
      type: String,
      enum: ["new", "used", "refurbished"],
      required: true,
    },
    productType: {
      type: String,
      enum: ["auction", "buy_now"],
      default: "buy_now",
    },
    stock: {
      type: Number,
      default: 1,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Auction fields
    auctionStartPrice: {
      type: Number,
      min: 0,
    },
    auctionCurrentPrice: {
      type: Number,
      min: 0,
    },
    auctionEndTime: Date,
    auctionStatus: {
      type: String,
      enum: ["active", "ended", "cancelled"],
    },
    // Shipping
    shippingCost: {
      type: Number,
      default: 0,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    shippingInfo: {
      type: String,
      default: "",
    },
    // Stats
    views: {
      type: Number,
      default: 0,
    },
    watchers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───
productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ productType: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
