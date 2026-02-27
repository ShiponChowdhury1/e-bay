import Link from "next/link";
import { getProductsAction, getCategoriesAction } from "@/actions/product.actions";
import { ProductType, CategoryType } from "@/types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";

export default async function HomePage() {
  const [productsRes, categoriesRes, auctionsRes] = await Promise.all([
    getProductsAction({ limit: 12, sort: "createdAt", order: "desc" }),
    getCategoriesAction(),
    getProductsAction({ productType: "auction", limit: 6 }),
  ]);

  const products = (productsRes.data || []) as ProductType[];
  const categories = (categoriesRes.data || []) as CategoryType[];
  const auctions = (auctionsRes.data || []) as ProductType[];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <CartSidebar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Buy &amp; Sell With Confidence
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8">
                Discover amazing deals on millions of items. Whether you&apos;re buying or selling, eBay is the place.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/products"
                  className="px-8 py-3 bg-white text-blue-700 font-bold rounded-full hover:bg-gray-100 transition"
                >
                  Shop Now
                </Link>
                <Link
                  href="/auctions"
                  className="px-8 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition"
                >
                  View Auctions
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat._id}`}
                  className="group bg-gray-50 rounded-xl p-4 text-center hover:shadow-lg hover:bg-blue-50 transition"
                >
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-blue-200 transition">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-full" />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
            <Link href="/products" className="text-blue-600 hover:underline font-medium text-sm">
              See All &rarr;
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg mb-4">No products yet</p>
              <Link href="/products/create" className="text-blue-600 hover:underline font-medium">
                Be the first to list one!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Active Auctions */}
        {auctions.length > 0 && (
          <section className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🔥 Active Auctions</h2>
                <Link href="/auctions" className="text-blue-600 hover:underline font-medium text-sm">
                  See All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {auctions.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} isAuction />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Start Selling Today</h2>
            <p className="text-lg mb-6 opacity-90">
              List your items and reach millions of buyers worldwide!
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-white text-orange-600 font-bold rounded-full hover:bg-gray-100 transition"
            >
              Create Seller Account
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ProductCard({ product, isAuction = false }: { product: ProductType; isAuction?: boolean }) {
  const pid = product._id || product.id;
  const price = isAuction ? product.auctionCurrentPrice || product.auctionStartPrice || product.price : product.price;

  return (
    <Link href={`/products/${pid}`} className="group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {isAuction && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              AUCTION
            </span>
          )}
          {product.condition !== "new" && (
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-gray-800/70 text-white text-xs rounded capitalize">
              {product.condition}
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition">
            {product.title}
          </h3>
          <p className="text-lg font-bold text-gray-900">
            ${price?.toFixed(2)}
          </p>
          {product.freeShipping && (
            <p className="text-xs text-green-600 font-medium mt-1">Free Shipping</p>
          )}
          {isAuction && product.auctionEndTime && (
            <p className="text-xs text-red-500 mt-1">
              Ends: {new Date(product.auctionEndTime).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
