"use client";

import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
} from "@/store/slices/cartSlice";

export default function CartPage() {
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const count = useAppSelector(selectCartItemCount);
  const dispatch = useAppDispatch();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add items to get started!</p>
        <Link href="/products" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({count} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const pid = item.product._id || item.product.id;
            return (
              <div key={pid} className="flex gap-4 bg-white rounded-xl border p-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${pid}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                    {item.product.title}
                  </Link>
                  <p className="text-sm text-gray-500 capitalize mt-1">{item.product.condition}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: pid, quantity: Math.max(1, item.quantity - 1) }))}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: pid, quantity: item.quantity + 1 }))}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => dispatch(removeFromCart(pid))}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => dispatch(clearCart())}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({count} items)</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600 font-medium">Calculated at checkout</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg">
              <span className="font-bold">Total</span>
              <span className="font-extrabold">${total.toFixed(2)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="block w-full mt-6 py-3 bg-blue-600 text-white text-center font-bold rounded-full hover:bg-blue-700 transition"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="block w-full mt-3 text-center text-sm text-blue-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
