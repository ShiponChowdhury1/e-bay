"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  adminGetCategoriesAction,
  adminCreateCategoryAction,
  adminUpdateCategoryAction,
  adminDeleteCategoryAction,
} from "@/actions/admin.actions";

// ─── Get All Categories ───
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => adminGetCategoriesAction(),
    staleTime: 5 * 60 * 1000, // Categories don't change often
  });
}

// ─── Create Category (Admin) ───
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; parent?: string }) =>
      adminCreateCategoryAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

// ─── Update Category (Admin) ───
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string; isActive?: boolean };
    }) => adminUpdateCategoryAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

// ─── Delete Category (Admin) ───
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminDeleteCategoryAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}
