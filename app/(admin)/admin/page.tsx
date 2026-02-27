"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminGetStatsAction } from "@/actions/admin.actions";
import { PlatformStats } from "@/types";

interface StatsResponse {
  success: boolean;
  data?: PlatformStats;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = (await adminGetStatsAction()) as StatsResponse;
      if (res.success) {
        setStats(res.data ?? null);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.users?.total || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600",
      ring: "ring-blue-500/20",
      href: "/admin/users",
    },
    {
      label: "Sellers",
      value: stats?.users?.sellers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "bg-green-50 text-green-600",
      ring: "ring-green-500/20",
    },
    {
      label: "Total Products",
      value: stats?.products?.total || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "bg-purple-50 text-purple-600",
      ring: "ring-purple-500/20",
      href: "/admin/products",
    },
    {
      label: "Active Auctions",
      value: stats?.products?.activeAuctions || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      color: "bg-red-50 text-red-600",
      ring: "ring-red-500/20",
    },
    {
      label: "Total Orders",
      value: stats?.orders?.total || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "bg-amber-50 text-amber-600",
      ring: "ring-amber-500/20",
      href: "/admin/orders",
    },
    {
      label: "Paid Orders",
      value: stats?.orders?.paid || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-emerald-50 text-emerald-600",
      ring: "ring-emerald-500/20",
    },
    {
      label: "Total Bids",
      value: stats?.bids?.total || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: "bg-pink-50 text-pink-600",
      ring: "ring-pink-500/20",
    },
    {
      label: "Revenue",
      value: `$${(stats?.revenue?.totalSales || 0).toLocaleString()}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-indigo-50 text-indigo-600",
      ring: "ring-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening on your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const inner = (
            <div
              key={card.label}
              className={`bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all ring-1 ${card.ring}`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${card.color} flex items-center justify-center`}>
                  <span className="scale-75 sm:scale-100">{card.icon}</span>
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-3 sm:mt-4">{card.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">{card.label}</p>
            </div>
          );
          return card.href ? (
            <Link href={card.href} key={card.label} className="block">
              {inner}
            </Link>
          ) : (
            <div key={card.label}>{inner}</div>
          );
        })}
      </div>

      {/* Alerts */}
      {stats?.users?.banned ? (
        <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-red-800 font-medium text-xs sm:text-sm">
              {stats.users.banned} banned user(s) on the platform
            </p>
            <p className="text-red-600 text-[10px] sm:text-xs mt-0.5">Review and manage banned users</p>
          </div>
          <Link
            href="/admin/users"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition w-full sm:w-auto text-center"
          >
            Manage
          </Link>
        </div>
      ) : null}

      {/* Monthly Sales Chart */}
      {stats?.monthlySales && stats.monthlySales.length > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Monthly Sales</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Revenue and orders breakdown by month</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></span>
                <span className="text-[10px] sm:text-xs font-medium text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"></span>
                <span className="text-[10px] sm:text-xs font-medium text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-6 pt-6 sm:pt-8">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={stats.monthlySales.map((m) => ({
                  month: new Date(m._id.year, m._id.month - 1).toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  }),
                  revenue: parseFloat(m.revenue.toFixed(2)),
                  orders: m.orders * 100,
                  actualOrders: m.orders,
                }))}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.96)",
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{ color: "#111827", fontWeight: 600, marginBottom: 8 }}
                  formatter={(value, name, props) => {
                    const payload = props?.payload as { actualOrders?: number } | undefined;
                    if (name === "revenue") return [`$${Number(value).toLocaleString()}`, "Revenue"];
                    if (name === "orders") return [payload?.actualOrders ?? value, "Orders"];
                    return [value, name];
                  }}
                  cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "5 5" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#ordersGradient)"
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/admin/users"
          className="flex items-center gap-3 sm:gap-4 bg-white rounded-lg sm:rounded-xl border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm sm:text-base">Manage Users</p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">View, ban, or change roles</p>
          </div>
        </Link>
        <Link
          href="/admin/products"
          className="flex items-center gap-3 sm:gap-4 bg-white rounded-lg sm:rounded-xl border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-purple-200 transition-all group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm sm:text-base">Manage Products</p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">Review and toggle listings</p>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          className="flex items-center gap-3 sm:gap-4 bg-white rounded-lg sm:rounded-xl border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-green-200 transition-all group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-green-100 transition">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm sm:text-base">Manage Categories</p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">Add, edit, or delete categories</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
