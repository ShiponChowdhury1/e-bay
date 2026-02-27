"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { adminGetProductsAction, adminToggleProductAction } from "@/actions/admin.actions";
import { ProductType } from "@/types";

interface ProductsResponse {
  success: boolean;
  data?: ProductType[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const res = (await adminGetProductsAction()) as ProductsResponse;
      if (res.success) {
        setProducts(res.data || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleToggle = async (productId: string) => {
    const res = await adminToggleProductAction(productId);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) =>
          (p._id || p.id) === productId ? { ...p, isActive: !p.isActive } : p
        )
      );
    }
  };

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">{products.length} total products</p>
        </div>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3">
        {filtered.map((p) => {
          const pid = p._id || p.id;
          return (
            <div key={pid} className={`bg-white rounded-lg border border-gray-100 p-4 ${!p.isActive ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${pid}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1 text-sm" target="_blank">
                    {p.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {typeof p.seller === "object" && p.seller !== null && "name" in p.seller
                      ? (p.seller as { name: string }).name
                      : "Unknown"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-gray-900 text-sm">${p.price.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      p.productType === "auction" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {p.productType === "auction" ? "Auction" : "Buy Now"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {p.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(pid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                    p.isActive ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  }`}
                >
                  {p.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No products found</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Seller</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const pid = p._id || p.id;
                return (
                  <tr key={pid} className={`hover:bg-gray-50/50 transition ${!p.isActive ? "opacity-60" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="max-w-[200px]">
                          <Link href={`/products/${pid}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1" target="_blank">
                            {p.title}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {typeof p.seller === "object" && p.seller !== null && "name" in p.seller
                        ? (p.seller as { name: string }).name
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">${p.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.productType === "auction"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {p.productType === "auction" ? "Auction" : "Buy Now"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {p.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(pid)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          p.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {p.isActive ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
