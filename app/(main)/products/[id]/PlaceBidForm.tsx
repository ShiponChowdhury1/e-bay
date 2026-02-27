"use client";

import { useState } from "react";
import { placeBidAction } from "@/actions/auction.actions";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";

export default function PlaceBidForm({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number;
}) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [amount, setAmount] = useState(currentPrice + 1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (amount <= currentPrice) {
      setError(`Bid must be higher than $${currentPrice.toFixed(2)}`);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await placeBidAction(productId, amount);
      if (res.success) {
        setMessage("Bid placed successfully!");
        setAmount(amount + 1);
        router.refresh();
      } else {
        setError(res.message || "Failed to place bid");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleBid} className="mt-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            min={currentPrice + 0.01}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full pl-7 pr-3 py-3 border rounded-lg text-lg font-bold"
            placeholder={`Min $${(currentPrice + 0.01).toFixed(2)}`}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? "Placing..." : "Place Bid"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
    </form>
  );
}
