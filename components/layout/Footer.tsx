import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Buy */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3">Buy</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/products" className="hover:text-blue-600 hover:underline">All Products</Link></li>
              <li><Link href="/auctions" className="hover:text-blue-600 hover:underline">Auctions</Link></li>
              <li><Link href="/products?condition=new" className="hover:text-blue-600 hover:underline">New Items</Link></li>
              <li><Link href="/products?condition=used" className="hover:text-blue-600 hover:underline">Used Items</Link></li>
              <li><Link href="/products?condition=refurbished" className="hover:text-blue-600 hover:underline">Refurbished</Link></li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3">Sell</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/register" className="hover:text-blue-600 hover:underline">Start Selling</Link></li>
              <li><Link href="/seller/products" className="hover:text-blue-600 hover:underline">Seller Dashboard</Link></li>
              <li><Link href="/products/create" className="hover:text-blue-600 hover:underline">List an Item</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/login" className="hover:text-blue-600 hover:underline">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-blue-600 hover:underline">Register</Link></li>
              <li><Link href="/orders" className="hover:text-blue-600 hover:underline">Order History</Link></li>
              <li><Link href="/my-bids" className="hover:text-blue-600 hover:underline">My Bids</Link></li>
            </ul>
          </div>

          {/* About eBay */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3">About</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="hover:text-blue-600 hover:underline cursor-pointer">About eBay</span></li>
              <li><span className="hover:text-blue-600 hover:underline cursor-pointer">Careers</span></li>
              <li><span className="hover:text-blue-600 hover:underline cursor-pointer">Policies</span></li>
              <li><span className="hover:text-blue-600 hover:underline cursor-pointer">Help & Contact</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} eBay Clone. All rights reserved. Built with Next.js
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span className="hover:underline cursor-pointer">Cookie Policy</span>
            <span className="hover:underline cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
