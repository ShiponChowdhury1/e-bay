"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  getActiveAuctionsAction,
  getBidHistoryAction,
  placeBidAction,
  getMyBidsAction,
} from "@/actions/auction.actions";

// ─── Get Active Auctions ───
export function useActiveAuctions(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.activeAuctions, page, limit],
    queryFn: () => getActiveAuctionsAction(page, limit),
  });
}

// ─── Get Bid History for Product ───
export function useBidHistory(productId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.bidHistory(productId), page, limit],
    queryFn: () => getBidHistoryAction(productId, page, limit),
    enabled: !!productId,
    refetchInterval: 10000, // Refetch every 10 seconds for live auctions
  });
}

// ─── Get My Bids ───
export function useMyBids(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.myBids, page, limit],
    queryFn: () => getMyBidsAction(page, limit),
  });
}

// ─── Place Bid ───
export function usePlaceBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, amount }: { productId: string; amount: number }) =>
      placeBidAction(productId, amount),
    onSuccess: (_, variables) => {
      // Invalidate bid history for this product
      queryClient.invalidateQueries({
        queryKey: queryKeys.bidHistory(variables.productId),
      });
      // Invalidate product to update current price
      queryClient.invalidateQueries({
        queryKey: queryKeys.product(variables.productId),
      });
      // Invalidate my bids
      queryClient.invalidateQueries({ queryKey: queryKeys.myBids });
      // Invalidate active auctions list
      queryClient.invalidateQueries({ queryKey: queryKeys.activeAuctions });
    },
  });
}
