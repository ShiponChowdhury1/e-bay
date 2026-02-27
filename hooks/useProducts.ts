"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  getProductsAction,
  getProductByIdAction,
  getProductBySlugAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  getSellerProductsAction,
} from "@/actions/product.actions";

// ─── Get Products List ───
export function useProducts(params?: {
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
  return useQuery({
    queryKey: [...queryKeys.products, params],
    queryFn: () => getProductsAction(params || {}),
  });
}

// ─── Get Single Product by ID ───
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProductByIdAction(id),
    enabled: !!id,
  });
}

// ─── Get Product by Slug ───
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.productBySlug(slug),
    queryFn: () => getProductBySlugAction(slug),
    enabled: !!slug,
  });
}

// ─── Get My Products (Seller) ───
export function useMyProducts(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.sellerProducts(), page, limit],
    queryFn: () => getSellerProductsAction(page, limit),
  });
}

// ─── Create Product ───
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
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
    }) => createProductAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerProducts() });
    },
  });
}

// ─── Update Product ───
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateProductAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.product(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerProducts() });
    },
  });
}

// ─── Delete Product ───
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProductAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerProducts() });
    },
  });
}
