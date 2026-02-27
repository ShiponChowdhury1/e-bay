"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  createOrderAction,
  getMyOrdersAction,
  getSellerOrdersAction,
  getOrderByIdAction,
  adminUpdateOrderStatusAction,
} from "@/actions/order.actions";

// ─── Get My Orders (Buyer) ───
export function useMyOrders(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.myOrders, page, limit],
    queryFn: () => getMyOrdersAction(page, limit),
  });
}

// ─── Get Seller Orders ───
export function useSellerOrders(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.sellerOrders, page, limit],
    queryFn: () => getSellerOrdersAction(page, limit),
  });
}

// ─── Get Single Order ───
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => getOrderByIdAction(orderId),
    enabled: !!orderId,
  });
}

// ─── Create Order ───
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
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
    }) => createOrderAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

// ─── Update Order Status (Admin) ───
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" }) =>
      adminUpdateOrderStatusAction(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
    },
  });
}
