"use client";

import { useState } from "react";
import Link from "next/link";
import { CategoryType } from "@/types";

interface MobileFiltersProps {
  categories: CategoryType[];
  params: {
    search?: string;
    category?: string;
    condition?: string;
    productType?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    order?: string;
  };
}

export default function MobileFilters({ categories, params }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const merged = { ...params, ...overrides };
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== "") q.set(key, value);
    }
    return `/products?${q.toString()}`;
  };

  const activeFiltersCount = [
    params.category,
    params.condition,
    params.productType,
    params.minPrice,
    params.maxPrice,
  ].filter(Boolean).length;

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Sheet */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-4 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <Link
                    href={buildUrl({ category: undefined })}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm ${
                      !params.category
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={buildUrl({ category: cat._id })}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm ${
                        params.category === cat._id
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">Condition</h3>
                <div className="space-y-2">
                  {[
                    { value: undefined, label: "All" },
                    { value: "new", label: "New" },
                    { value: "used", label: "Used" },
                    { value: "refurbished", label: "Refurbished" },
                  ].map((c) => (
                    <Link
                      key={c.label}
                      href={buildUrl({ condition: c.value })}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm ${
                        params.condition === c.value || (!params.condition && !c.value)
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Buying Format */}
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">Buying Format</h3>
                <div className="space-y-2">
                  {[
                    { value: undefined, label: "All" },
                    { value: "buy_now", label: "Buy It Now" },
                    { value: "auction", label: "Auction" },
                  ].map((t) => (
                    <Link
                      key={t.label}
                      href={buildUrl({ productType: t.value })}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm ${
                        params.productType === t.value || (!params.productType && !t.value)
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">Price Range</h3>
                <form
                  className="flex gap-2 items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const minPrice = formData.get("minPrice") as string;
                    const maxPrice = formData.get("maxPrice") as string;
                    window.location.href = buildUrl({
                      minPrice: minPrice || undefined,
                      maxPrice: maxPrice || undefined,
                    });
                  }}
                >
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    defaultValue={params.minPrice}
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    defaultValue={params.maxPrice}
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 text-center text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Clear All Filters
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
