"use client";

import { useState, useEffect } from "react";
import { adminGetStatsAction } from "@/actions/admin.actions";
import { PlatformStats } from "@/types";

interface StatsResponse {
  success: boolean;
  data?: PlatformStats;
}

interface MonthlySale {
  _id: { year: number; month: number };
  revenue: number;
  orders: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    const fetch = async () => {
      const res = (await adminGetStatsAction()) as StatsResponse;
      if (res.success) setStats(res.data ?? null);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Platform performance insights</p>
        </div>
        <div className="flex gap-2">
          {[
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "90 Days", value: "90d" },
            { label: "1 Year", value: "1y" },
          ].map((d) => (
            <button
              key={d.value}
              onClick={() => setDateRange(d.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                dateRange === d.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="text-xl font-bold text-gray-900">${(stats?.revenue?.totalSales || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Products</p>
              <p className="text-xl font-bold text-gray-900">{stats?.products?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Orders</p>
              <p className="text-xl font-bold text-gray-900">{stats?.orders?.total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Sales */}
      {stats?.monthlySales && stats.monthlySales.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Revenue by Month</h2>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Month</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Revenue</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Orders</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Avg. Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.monthlySales.map((m: MonthlySale) => (
                  <tr key={`${m._id.year}-${m._id.month}`} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {new Date(m._id.year, m._id.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-700">${m.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{m.orders}</td>
                    <td className="px-6 py-4 text-gray-600">${m.orders > 0 ? (m.revenue / m.orders).toFixed(2) : "0.00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
