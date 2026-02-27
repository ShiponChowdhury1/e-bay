// ─── Shared Types for Frontend ───

export type UserRole = "admin" | "seller" | "buyer";

export interface UserType {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isBanned?: boolean;
  banReason?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductType {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  seller: {
    _id: string;
    name: string;
    avatar?: string;
  };
  condition: "new" | "used" | "refurbished";
  productType: "auction" | "buy_now";
  stock: number;
  sold: number;
  specifications?: Record<string, string>;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  auctionStartPrice?: number;
  auctionCurrentPrice?: number;
  auctionEndTime?: string;
  auctionStatus?: "active" | "ended" | "cancelled";
  shippingCost: number;
  freeShipping: boolean;
  shippingInfo: string;
  views: number;
  watchers: number;
  createdAt: string;
  updatedAt: string;
}

export interface BidType {
  _id: string;
  product: string | ProductType;
  bidder: {
    _id: string;
    name: string;
    avatar?: string;
  };
  amount: number;
  isHighest: boolean;
  createdAt: string;
}

export interface OrderItemType {
  product: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddressType {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderType {
  _id: string;
  buyer: UserType;
  seller: UserType;
  items: OrderItemType[];
  totalAmount: number;
  shippingCost: number;
  tax: number;
  grandTotal: number;
  shippingAddress: ShippingAddressType;
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive: boolean;
}

export interface CartItem {
  product: ProductType;
  quantity: number;
}

export interface PaginationType {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: PaginationType;
}

export interface PlatformStats {
  users: {
    total: number;
    sellers: number;
    buyers: number;
    banned: number;
  };
  products: {
    total: number;
    activeAuctions: number;
  };
  orders: {
    total: number;
    paid: number;
  };
  bids: { total: number };
  revenue: { totalSales: number };
  monthlySales: Array<{
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }>;
}
