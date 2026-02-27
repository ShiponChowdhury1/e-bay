"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { getMyOrdersAction } from "@/actions/order.actions";
import { OrderType } from "@/types";

interface OrdersResponse {
  success: boolean;
  data?: OrderType[];
}

export default function OrdersPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      const res = (await getMyOrdersAction()) as OrdersResponse;
      if (res.success) {
        setOrders(res.data || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-16 sm:py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-500 text-sm mt-4">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-base sm:text-lg mb-4">No orders yet</p>
          <Link href="/products" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`} className="block">
              <div className="bg-white rounded-lg sm:rounded-xl border p-3 sm:p-5 hover:shadow-md transition active:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <StatusBadge status={order.orderStatus} />
                    <PaymentBadge status={order.paymentStatus} />
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                  {(order.items || []).slice(0, 5).map((item, i) => (
                    <div key={i} className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg overflow-hidden relative">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                      )}
                    </div>
                  ))}
                  {(order.items?.length || 0) > 5 && (
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                      +{(order.items?.length || 0) - 5}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500">{order.items?.length ?? 0} item(s)</p>
                  <p className="text-base sm:text-lg font-bold">${order.grandTotal.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
