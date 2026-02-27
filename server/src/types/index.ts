import { Request } from "express";

// ─── User Roles ───
export type UserRole = "admin" | "seller" | "buyer";

// ─── Authenticated Request ───
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

// ─── Product Types ───
export type ProductType = "auction" | "buy_now";
export type ProductCondition = "new" | "used" | "refurbished";

// ─── Order Status ───
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// ─── Auction Status ───
export type AuctionStatus = "active" | "ended" | "cancelled";

// ─── API Response ───
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Token Payload ───
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}
