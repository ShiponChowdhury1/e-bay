"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { getSellerProductsAction, deleteProductAction } from "@/actions/product.actions";
import { ProductType } from "@/types";

interface ProductsResponse {
  success: boolean;
  data?: ProductType[];
}

export default function SellerProductsPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "seller" && user?.role !== "admin")) {
      router.push("/login");
      return;
    }

    const fetch = async () => {
      const res = (await getSellerProductsAction()) as ProductsResponse;
      if (res.success) {
        setProducts(res.data || []);
      }
      setLoading(false);
    };
    fetch();
  }, [isAuthenticated, user, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await deleteProductAction(id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Products</h1>
        <Link
          href="/products/create"
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm sm:text-base text-center"
        >
          + List New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-lg sm:rounded-xl">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 text-base sm:text-lg mb-4">No products listed yet</p>
          <Link href="/products/create" className="text-blue-600 hover:underline font-medium text-sm sm:text-base">
            List your first product
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="sm:hidden space-y-3">
            {products.map((p) => {
              const pid = p._id || p.id;
              return (
                <div key={pid} className="bg-white rounded-lg border border-gray-100 p-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${pid}`} className="font-medium text-gray-900 text-sm line-clamp-1">{p.title}</Link>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{p.condition}</p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-2">
                        <span className="font-bold text-sm">${p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-400">Stock: {p.stock}</span>
                        <span className="text-[10px] text-gray-400">Sold: {p.sold}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          p.productType === "auction" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {p.productType === "auction" ? "Auction" : "Buy Now"}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Link
                      href={`/products/${pid}`}
                      className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-medium text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(pid)}
                      className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Product</th>
                    <th className="text-left px-4 py-3 font-semibold">Price</th>
                    <th className="text-left px-4 py-3 font-semibold">Stock</th>
                    <th className="text-left px-4 py-3 font-semibold">Sold</th>
                    <th className="text-left px-4 py-3 font-semibold">Type</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => {
                    const pid = p._id || p.id;
                    return (
                      <tr key={pid} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                              {p.images?.[0] ? (
                                <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                              )}
                            </div>
                            <div className="max-w-[200px]">
                              <Link href={`/products/${pid}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                                {p.title}
                              </Link>
                              <p className="text-xs text-gray-500 capitalize">{p.condition}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold">${p.price.toFixed(2)}</td>
                        <td className="px-4 py-3">{p.stock}</td>
                        <td className="px-4 py-3">{p.sold}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            p.productType === "auction" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {p.productType === "auction" ? "Auction" : "Buy Now"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link
                              href={`/products/${pid}`}
                              className="text-blue-600 hover:underline text-xs"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDelete(pid)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
