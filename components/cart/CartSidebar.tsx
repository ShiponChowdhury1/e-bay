"use client";

import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeFromCart, updateQuantity, clearCart, toggleCart, selectCartItems, selectCartTotal, selectCartItemCount } from "@/store/slices/cartSlice";

export default function CartSidebar() {
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const count = useAppSelector(selectCartItemCount);
  const isOpen = useAppSelector((state) => state.cart.isOpen);
  const dispatch = useAppDispatch();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={() => dispatch(toggleCart())}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Shopping Cart ({count})
          </h2>
          <button
            onClick={() => dispatch(toggleCart())}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Link
                href="/products"
                onClick={() => dispatch(toggleCart())}
                className="text-blue-600 hover:underline font-medium"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const pid = item.product._id || item.product.id;
              return (
                <div key={pid} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.title}
                    </h3>
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      ${item.product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ productId: pid, quantity: Math.max(1, item.quantity - 1) }))
                        }
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ productId: pid, quantity: item.quantity + 1 }))
                        }
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => dispatch(removeFromCart(pid))}
                        className="ml-auto text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({count} items)</span>
              <span className="font-bold text-lg text-gray-900">${total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => dispatch(toggleCart())}
              className="block w-full py-3 bg-blue-600 text-white text-center rounded-full font-semibold hover:bg-blue-700 transition"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/cart"
              onClick={() => dispatch(toggleCart())}
              className="block w-full py-3 bg-gray-100 text-gray-700 text-center rounded-full font-medium hover:bg-gray-200 transition"
            >
              View Cart
            </Link>
            <button
              onClick={() => dispatch(clearCart())}
              className="block w-full text-center text-sm text-red-500 hover:text-red-700"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
