"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { getSellerOrdersAction } from "@/actions/order.actions";
import { OrderType } from "@/types";

interface OrdersResponse {
  success: boolean;
  data?: OrderType[];
}

export default function SellerOrdersPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "seller" && user?.role !== "admin")) {
      router.push("/login");
      return;
    }

    const fetch = async () => {
      const res = (await getSellerOrdersAction()) as OrdersResponse;
      if (res.success) {
        setOrders(res.data || []);
      }
      setLoading(false);
    };
    fetch();
  }, [isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Orders</h1>
        <Link href="/seller/products" className="text-blue-600 hover:underline text-sm font-medium">
          My Products
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg mb-2">No orders received yet</p>
          <p className="text-gray-400 text-sm">Your product orders will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold">Buyer</th>
                <th className="text-left px-4 py-3 font-semibold">Items</th>
                <th className="text-left px-4 py-3 font-semibold">Total</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Payment</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order._id}`} className="text-blue-600 hover:underline font-mono text-xs">
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.buyer?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{order.buyer?.email}</p>
                  </td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3 font-bold">${order.grandTotal.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
                      order.orderStatus === "cancelled" ? "bg-red-100 text-red-700" :
                      order.orderStatus === "shipped" ? "bg-purple-100 text-purple-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      order.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
