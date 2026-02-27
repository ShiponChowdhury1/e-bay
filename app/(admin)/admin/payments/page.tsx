"use client";

import { useState, useEffect } from "react";
import { adminGetPaymentStatsAction, adminGetPaymentTransactionsAction } from "@/actions/admin.actions";

interface PaymentStats {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  totalRevenue: number;
  successfulRevenue: number;
}

interface Transaction {
  _id: string;
  orderId: string;
  buyer: { name: string; email: string };
  amount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [statsRes, transRes] = await Promise.all([
        adminGetPaymentStatsAction(),
        adminGetPaymentTransactionsAction(page, 10, filter),
      ]);
      
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (transRes.success) {
        setTransactions(transRes.data || []);
        setTotalPages(transRes.pagination?.totalPages || 1);
      }
      setLoading(false);
    };
    fetchData();
  }, [page, filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "failed":
      case "refunded":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 text-sm mt-1">Manage payment transactions and payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {loading ? "..." : stats?.total || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ${loading ? "..." : (stats?.totalRevenue || 0).toFixed(2)} total
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {loading ? "..." : stats?.successful || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ${loading ? "..." : (stats?.successfulRevenue || 0).toFixed(2)} received
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            {loading ? "..." : stats?.pending || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Failed/Refunded</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {loading ? "..." : stats?.failed || 0}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold">Recent Transactions</h2>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed/Refunded</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions found</h3>
            <p className="text-gray-400 text-sm">Payment transactions will appear here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-sm text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Order ID</th>
                    <th className="text-left px-4 py-3 font-medium">Customer</th>
                    <th className="text-left px-4 py-3 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Method</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium">#{tx.orderId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{tx.buyer?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{tx.buyer?.email || ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">${tx.amount.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm capitalize">{tx.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(tx.paymentStatus)}`}>
                          {tx.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
