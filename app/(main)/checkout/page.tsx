"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectCartItems, selectCartTotal, clearCart } from "@/store/slices/cartSlice";
import { createOrderAction } from "@/actions/order.actions";
import { createStripeCheckoutAction } from "@/actions/payment.actions";
import Image from "next/image";
import Link from "next/link";

interface OrderResponse {
  success: boolean;
  data?: { _id: string };
  message?: string;
}

export default function CheckoutPage() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shipping, setShipping] = useState({
    fullName: user?.name || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  const shippingCost = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shippingCost + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/products" className="text-blue-600 hover:underline">Browse Products</Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to checkout</h1>
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.product._id || item.product.id || "",
          quantity: item.quantity,
        })),
        shippingAddress: shipping,
        paymentMethod,
      };

      const res = (await createOrderAction(orderData)) as OrderResponse;

      if (res.success) {
        const orderId = res.data?._id;
        
        // If card payment, redirect to Stripe Checkout
        if (paymentMethod === "card" && orderId) {
          const stripeRes = await createStripeCheckoutAction(orderId);
          
          if (stripeRes.success && stripeRes.url) {
            dispatch(clearCart());
            // Redirect to Stripe Checkout
            window.location.href = stripeRes.url;
            return;
          } else {
            setError(stripeRes.message || "Failed to create payment session");
            setLoading(false);
            return;
          }
        }
        
        // For COD or other methods, just redirect to order page
        dispatch(clearCart());
        router.push(`/orders/${orderId || ""}`);
      } else {
        setError(res.message || "Failed to place order");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping + Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
                  <input
                    name="fullName"
                    value={shipping.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Street Address *</label>
                  <input
                    name="street"
                    value={shipping.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City *</label>
                  <input
                    name="city"
                    value={shipping.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">State *</label>
                  <input
                    name="state"
                    value={shipping.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ZIP Code *</label>
                  <input
                    name="zipCode"
                    value={shipping.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Country *</label>
                  <select
                    name="country"
                    value={shipping.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="BD">Bangladesh</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Phone *</label>
                  <input
                    name="phone"
                    value={shipping.phone}
                    onChange={handleChange}
                    required
                    type="tel"
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: "card", label: "Credit / Debit Card (Stripe)", icon: "💳" },
                  { value: "cod", label: "Cash on Delivery", icon: "💵" },
                ].map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === pm.value ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="radio radio-sm radio-primary"
                    />
                    <span className="text-xl">{pm.icon}</span>
                    <span className="font-medium">{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            {/* Items preview */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product._id || item.product.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                    {item.product.images?.[0] ? (
                      <Image src={item.product.images[0]} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.product.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Placing Order..." : `Place Order — $${grandTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
