import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — এই সময়ের মধ্যে same data refetch হবে না
      gcTime: 30 * 60 * 1000, // 30 minutes — localStorage এ cache থাকবে
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// localStorage এ cache persist করার জন্য — refresh এ data থাকবে
export const localStoragePersister =
  typeof window !== "undefined"
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: "EBAY_QUERY_CACHE",
        throttleTime: 1000,
      })
    : null;

// Query Keys - centralized for consistency
export const queryKeys = {
  // Products
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,
  productBySlug: (slug: string) => ["products", "slug", slug] as const,
  sellerProducts: (sellerId?: string) => ["products", "seller", sellerId] as const,

  // Categories
  categories: ["categories"] as const,
  category: (id: string) => ["categories", id] as const,

  // Auctions
  auctions: ["auctions"] as const,
  activeAuctions: ["auctions", "active"] as const,
  bidHistory: (productId: string) => ["auctions", "bids", productId] as const,
  myBids: ["auctions", "myBids"] as const,

  // Orders
  orders: ["orders"] as const,
  myOrders: ["orders", "my"] as const,
  sellerOrders: ["orders", "seller"] as const,
  order: (id: string) => ["orders", id] as const,

  // Users
  currentUser: ["user", "current"] as const,
  users: ["users"] as const,
  user: (id: string) => ["users", id] as const,

  // Admin
  adminUsers: ["admin", "users"] as const,
  adminProducts: ["admin", "products"] as const,
  adminOrders: ["admin", "orders"] as const,
  adminStats: ["admin", "stats"] as const,
};
