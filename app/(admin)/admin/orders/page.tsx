"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import {
  adminGetAllOrdersAction,
  adminUpdateOrderStatusAction,
} from "@/actions/order.actions";

interface OrderData {
  _id: string;
  buyer: { _id: string; name: string; email: string; avatar?: string };
  seller: { _id: string; name: string; email: string; avatar?: string };
  items: Array<{
    product: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  shippingCost: number;
  tax: number;
  grandTotal: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await adminGetAllOrdersAction(1, 200);
      if (res.success) setOrders(res.data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  ) => {
    setUpdatingId(orderId);
    const res = await adminUpdateOrderStatusAction(orderId, newStatus);
    if (res.success && res.data) {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? (res.data as OrderData) : o))
      );
    }
    setUpdatingId(null);
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.orderStatus === filter);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.orderStatus === "pending").length,
    confirmed: orders.filter((o) => o.orderStatus === "confirmed").length,
    shipped: orders.filter((o) => o.orderStatus === "shipped").length,
    delivered: orders.filter((o) => o.orderStatus === "delivered").length,
    cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          View and manage all platform orders ({orders.length} total)
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-2">
        {(
          ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const
        ).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition whitespace-nowrap ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status}{" "}
            <span className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs opacity-75">
              ({statusCounts[status]})
            </span>
          </button>
        ))}
      </div>

      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div 
              className="p-3 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-blue-600">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                    order.orderStatus === "delivered" ? "bg-green-100 text-green-700"
                    : order.orderStatus === "confirmed" ? "bg-blue-100 text-blue-700"
                    : order.orderStatus === "cancelled" ? "bg-red-100 text-red-700"
                    : order.orderStatus === "shipped" ? "bg-purple-100 text-purple-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{order.buyer?.name} - {order.items?.length || 0} items</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">${order.grandTotal?.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Expanded Details */}
            {expandedId === order._id && (
              <div className="border-t border-gray-100 p-3 space-y-3 bg-gray-50/50">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Buyer:</span>
                    <p className="font-medium">{order.buyer?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Seller:</span>
                    <p className="font-medium">{order.seller?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span>
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                      order.paymentStatus === "paid" ? "bg-green-100 text-green-700"
                      : order.paymentStatus === "failed" ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                    }`}>{order.paymentStatus}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <span className="ml-1 uppercase">{order.paymentMethod}</span>
                  </div>
                </div>
                
                {/* Items */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white rounded p-2">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden relative shrink-0">
                        {item.image && <Image src={item.image} alt="" fill className="object-cover" unoptimized />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-500">${item.price} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {order.orderStatus === "pending" && (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleStatusChange(order._id, "confirmed")}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                    >
                      {updatingId === order._id ? "..." : "Approve"}
                    </button>
                  )}
                  {order.orderStatus === "confirmed" && (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleStatusChange(order._id, "shipped")}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                    >
                      {updatingId === order._id ? "..." : "Ship"}
                    </button>
                  )}
                  {order.orderStatus === "shipped" && (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleStatusChange(order._id, "delivered")}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                    >
                      {updatingId === order._id ? "..." : "Delivered"}
                    </button>
                  )}
                  {(order.orderStatus === "pending" || order.orderStatus === "confirmed") && (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleStatusChange(order._id, "cancelled")}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No orders found</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Order ID
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Buyer
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Seller
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Items
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                Total
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                Tax
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                Grand Total
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Payment
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order) => (
              <Fragment key={order._id}>
                {/* Main row */}
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === order._id ? null : order._id)
                  }
                >
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {order.buyer?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.buyer?.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {order.seller?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.seller?.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {order.items?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${order.totalAmount?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    ${order.tax?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    ${order.grandTotal?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      <span className="text-xs text-gray-400 uppercase">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        order.orderStatus === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.orderStatus === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : order.orderStatus === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.orderStatus === "shipped"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {order.orderStatus === "pending" && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order._id, "confirmed");
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition whitespace-nowrap"
                      >
                        {updatingId === order._id ? "Approving..." : "Approve"}
                      </button>
                    )}
                    {order.orderStatus === "confirmed" && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order._id, "shipped");
                        }}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-50 transition whitespace-nowrap"
                      >
                        {updatingId === order._id ? "Updating..." : "Ship"}
                      </button>
                    )}
                    {order.orderStatus === "shipped" && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order._id, "delivered");
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
                      >
                        {updatingId === order._id ? "Updating..." : "Delivered"}
                      </button>
                    )}
                    {(order.orderStatus === "delivered" ||
                      order.orderStatus === "cancelled") && (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>

                {/* Expanded detail row */}
                {expandedId === order._id && (
                  <tr>
                    <td colSpan={11} className="bg-gray-50 px-6 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Items */}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                            Order Items
                          </h4>
                          <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 bg-white rounded-lg p-2 border"
                              >
                                {item.image && (
                                  <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity} x ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-gray-900">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                            Shipping Address
                          </h4>
                          <div className="bg-white rounded-lg p-4 border text-sm space-y-1">
                            <p className="font-medium text-gray-900">
                              {order.shippingAddress?.fullName}
                            </p>
                            <p className="text-gray-600">
                              {order.shippingAddress?.street}
                            </p>
                            <p className="text-gray-600">
                              {order.shippingAddress?.city},{" "}
                              {order.shippingAddress?.state}{" "}
                              {order.shippingAddress?.zipCode}
                            </p>
                            <p className="text-gray-600">
                              {order.shippingAddress?.country}
                            </p>
                            <p className="text-gray-500 mt-2">
                              Phone: {order.shippingAddress?.phone}
                            </p>
                          </div>
                        </div>

                        {/* Summary */}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                            Payment Summary
                          </h4>
                          <div className="bg-white rounded-lg p-4 border text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Subtotal</span>
                              <span className="font-medium">
                                ${order.totalAmount?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Shipping</span>
                              <span className="font-medium">
                                ${order.shippingCost?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Tax</span>
                              <span className="font-medium">
                                ${order.tax?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                              <span className="font-bold text-gray-900">
                                Grand Total
                              </span>
                              <span className="font-bold text-gray-900">
                                ${order.grandTotal?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="text-gray-500">Method</span>
                              <span className="font-medium uppercase">
                                {order.paymentMethod}
                              </span>
                            </div>
                            {order.trackingNumber && (
                              <div className="flex justify-between mt-2">
                                <span className="text-gray-500">Tracking</span>
                                <span className="font-mono text-xs">
                                  {order.trackingNumber}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between mt-2">
                              <span className="text-gray-500">Order ID</span>
                              <span className="font-mono text-xs text-gray-400">
                                {order._id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No orders found</p>
            <p className="text-sm mt-1">
              {filter !== "all"
                ? `No ${filter} orders. Try a different filter.`
                : "No orders have been placed yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
