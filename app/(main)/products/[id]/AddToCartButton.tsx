"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { ProductType } from "@/types";

export default function AddToCartButton({ product }: { product: ProductType }) {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    dispatch(addToCart({ product, quantity }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Qty:</label>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 hover:bg-gray-100 text-lg"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-14 text-center border-x py-2"
            min={1}
            max={product.stock}
          />
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-3 py-2 hover:bg-gray-100 text-lg"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={added}
        className={`w-full py-3 rounded-full font-bold text-lg transition ${
          added
            ? "bg-green-500 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {added ? "✓ Added to Cart" : "Add to Cart"}
      </button>
    </div>
  );
}
