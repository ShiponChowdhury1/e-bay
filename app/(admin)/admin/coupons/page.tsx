"use client";

import { useState } from "react";

const sampleCoupons = [
  { code: "WELCOME10", discount: "10%", type: "percentage", minOrder: 50, status: "active", uses: 23, maxUses: 100, expires: "2026-06-30" },
  { code: "FLAT20OFF", discount: "$20", type: "fixed", minOrder: 100, status: "active", uses: 8, maxUses: 50, expires: "2026-04-15" },
  { code: "SUMMER25", discount: "25%", type: "percentage", minOrder: 75, status: "expired", uses: 50, maxUses: 50, expires: "2025-08-31" },
];

export default function AdminCouponsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">New Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Coupon Code</label>
              <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="e.g. SAVE20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg">
                <option>Percentage</option>
                <option>Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Value</label>
              <input type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Order ($)</label>
              <input type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Uses</label>
              <input type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
              <input type="date" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
              Create
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Discount</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Min Order</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Usage</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Expires</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleCoupons.map((c) => (
                <tr key={c.code} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{c.code}</td>
                  <td className="px-6 py-4 font-semibold">{c.discount}</td>
                  <td className="px-6 py-4 text-gray-600">${c.minOrder}</td>
                  <td className="px-6 py-4 text-gray-600">{c.uses}/{c.maxUses}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{c.expires}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
