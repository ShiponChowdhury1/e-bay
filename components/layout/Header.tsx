"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { selectCartItemCount, toggleCart } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartItemCount);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

   

  const handleLogout = async () => {
    await dispatch(logout());
    setShowUserMenu(false);
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-100 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8">
          <div className="flex gap-4">
            {isAuthenticated && user?.role === "seller" && (
              <Link href="/seller/products" className="hover:text-blue-600">
                Seller Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/admin" className="hover:text-blue-600">
             
              </Link>
            )}
          </div>
          <div className="flex gap-4">
            {isAuthenticated && (
              <>
                <Link href="/my-bids" className="hover:text-blue-600">My Bids</Link>
                <Link href="/orders" className="hover:text-blue-600">My Orders</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl md:text-3xl font-bold text-blue-600 tracking-tight">
              eBay
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for anything..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
                >
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                          {user?.role}
                        </span>
                      </div>
                      <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                        My Orders
                      </Link>
                      <Link href="/my-bids" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                        My Bids
                      </Link>
                      {user?.role === "seller" && (
                        <>
                          <Link href="/seller/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                            My Products
                          </Link>
                          <Link href="/seller/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                            Seller Orders
                          </Link>
                          <Link href="/products/create" className="block px-4 py-2 text-sm text-green-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                            + List New Product
                          </Link>
                        </>
                      )}
                      {user?.role === "admin" && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50 font-medium" onClick={() => setShowUserMenu(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </span>
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="border-t border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 h-10 text-sm">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition font-medium">
              All Products
            </Link>
            <Link href="/auctions" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Auctions
            </Link>
            <Link href="/products?condition=new" className="text-gray-600 hover:text-blue-600 transition">
              New
            </Link>
            <Link href="/products?condition=used" className="text-gray-600 hover:text-blue-600 transition">
              Used
            </Link>
            <Link href="/products?condition=refurbished" className="text-gray-600 hover:text-blue-600 transition">
              Refurbished
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link href="/products" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setShowMobileMenu(false)}>
              All Products
            </Link>
            <Link href="/auctions" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setShowMobileMenu(false)}>
              Auctions
            </Link>
            <Link href="/cart" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setShowMobileMenu(false)}>
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
