"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { getOrderByIdAction, cancelOrderAction } from "@/actions/order.actions";
import { verifyPaymentAction } from "@/actions/payment.actions";
import { generateInvoicePDF } from "@/lib/generateInvoice";
import { OrderType } from "@/types";
import { use, Suspense } from "react";

interface OrderResponse {
  success: boolean;
  data?: OrderType;
}

function OrderDetailContent({ id }: { id: string }) {
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const payment = searchParams.get("payment");
  
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{ type: "success" | "error" | "cancelled"; text: string } | null>(null);

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchOrder = async () => {
      const res = (await getOrderByIdAction(id)) as OrderResponse;
      if (res.success && res.data) {
        setOrder(res.data);
        
        // Handle payment status from Stripe redirect
        if (payment === "success") {
          // Verify and update payment status
          const verifyRes = await verifyPaymentAction(id);
          if (verifyRes.success) {
            setPaymentMessage({ type: "success", text: "Payment successful! Your order is confirmed." });
            setOrder(prev => prev ? { ...prev, paymentStatus: "paid" } : null);
          } else {
            setPaymentMessage({ type: "success", text: "Payment received! Order is being processed." });
          }
        } else if (payment === "cancelled") {
          setPaymentMessage({ type: "cancelled", text: "Payment was cancelled. You can try again later." });
        }
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id, isAuthenticated, authLoading, router, payment]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    const res = await cancelOrderAction(id);
    if (res.success) {
      setOrder((prev) => prev ? { ...prev, orderStatus: "cancelled" } : null);
    }
    setCancelling(false);
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    setDownloading(true);
    try {
      generateInvoicePDF(order);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
    }
    setDownloading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold mb-4">Order not found</h1>
        <Link href="/orders" className="text-blue-600 hover:underline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Payment Status Banner */}
      {paymentMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          paymentMessage.type === "success" ? "bg-green-100 border border-green-300 text-green-800" :
          paymentMessage.type === "cancelled" ? "bg-yellow-100 border border-yellow-300 text-yellow-800" :
          "bg-red-100 border border-red-300 text-red-800"
        }`}>
          <div className="flex items-center gap-2">
            {paymentMessage.type === "success" && <span className="text-xl">✅</span>}
            {paymentMessage.type === "cancelled" && <span className="text-xl">⚠️</span>}
            {paymentMessage.type === "error" && <span className="text-xl">❌</span>}
            <p className="font-medium">{paymentMessage.text}</p>
          </div>
        </div>
      )}

      <Link href="/orders" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Orders</Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
            order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
            order.orderStatus === "cancelled" ? "bg-red-100 text-red-700" :
            order.orderStatus === "shipped" ? "bg-purple-100 text-purple-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {order.orderStatus}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
            order.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
            order.paymentStatus === "failed" ? "bg-red-100 text-red-700" :
            "bg-orange-100 text-orange-700"
          }`}>
            Payment: {order.paymentStatus}
          </span>
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {downloading ? "Generating..." : "Download Invoice"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-bold">Items ({order.items?.length || 0})</h2>
            </div>
            <div className="divide-y">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-4 p-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
          <div className="bg-white rounded-xl border mt-4 p-4">
            <h2 className="font-bold mb-3">Shipping Address</h2>
            <p className="text-sm text-gray-700">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
            <p className="text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
          </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3 capitalize">
              Payment: {order.paymentMethod}
            </p>
            {order.trackingNumber && (
              <p className="text-sm text-gray-500 mt-1">
                Tracking: <strong>{order.trackingNumber}</strong>
              </p>
            )}
          </div>

          {order.orderStatus === "pending" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    }>
      <OrderDetailContent id={id} />
    </Suspense>
  );
}
