"use client";

import { useState } from "react";

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState("pages");

  const pages = [
    { title: "Home Page", slug: "/", status: "published", lastEdited: "2026-02-25" },
    { title: "About Us", slug: "/about", status: "published", lastEdited: "2026-02-20" },
    { title: "Contact", slug: "/contact", status: "draft", lastEdited: "2026-02-18" },
    { title: "Terms of Service", slug: "/terms", status: "published", lastEdited: "2026-01-15" },
    { title: "Privacy Policy", slug: "/privacy", status: "published", lastEdited: "2026-01-15" },
    { title: "FAQ", slug: "/faq", status: "draft", lastEdited: "2026-02-10" },
  ];

  const banners = [
    { title: "Hero Banner", position: "Homepage Top", status: "active", image: "hero-banner.jpg" },
    { title: "Sale Banner", position: "Homepage Middle", status: "active", image: "sale-banner.jpg" },
    { title: "Footer Promo", position: "Footer", status: "inactive", image: "footer-promo.jpg" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage pages, banners, and site content</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Page
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {["pages", "banners"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition ${
              activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "pages" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Page Title</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Slug</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Last Edited</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pages.map((p) => (
                  <tr key={p.slug} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{p.lastEdited}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">Edit</button>
                        <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "banners" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.title} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{b.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    b.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{b.position}</p>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition text-center">Edit</button>
                  <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
