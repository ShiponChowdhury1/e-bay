import Link from "next/link";
import { getProductsAction, getCategoriesAction } from "@/actions/product.actions";
import { ProductType, CategoryType } from "@/types";

interface SearchParams {
  search?: string;
  category?: string;
  condition?: string;
  productType?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  order?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const res = await getProductsAction({
    page,
    limit: 24,
    search: params.search,
    category: params.category,
    condition: params.condition,
    productType: params.productType,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    sort: params.sort || "createdAt",
    order: (params.order as "asc" | "desc") || "desc",
  });

  const categoriesRes = await getCategoriesAction();
  const products = (res.data || []) as ProductType[];
  const categories = (categoriesRes.data || []) as CategoryType[];
  const pagination = res.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Products</span>
        {params.search && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Search: &quot;{params.search}&quot;</span>
          </>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-3">Category</h3>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href={buildUrl(params, { category: undefined })}
                    className={`text-sm ${!params.category ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      href={buildUrl(params, { category: cat._id })}
                      className={`text-sm ${params.category === cat._id ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Condition */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-3">Condition</h3>
              <ul className="space-y-1.5">
                {[undefined, "new", "used", "refurbished"].map((c) => (
                  <li key={c || "all"}>
                    <Link
                      href={buildUrl(params, { condition: c })}
                      className={`text-sm capitalize ${params.condition === c || (!params.condition && !c) ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}`}
                    >
                      {c || "All"}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Type */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-3">Buying Format</h3>
              <ul className="space-y-1.5">
                {[
                  { value: undefined, label: "All" },
                  { value: "buy_now", label: "Buy It Now" },
                  { value: "auction", label: "Auction" },
                ].map((t) => (
                  <li key={t.label}>
                    <Link
                      href={buildUrl(params, { productType: t.value })}
                      className={`text-sm ${params.productType === t.value || (!params.productType && !t.value) ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}`}
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price range */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-3">Price</h3>
              <form className="flex gap-2 items-center">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  defaultValue={params.minPrice}
                  className="w-20 px-2 py-1.5 border rounded text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={params.maxPrice}
                  className="w-20 px-2 py-1.5 border rounded text-sm"
                />
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Go
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-sm text-gray-600">
              {pagination ? (
                <><strong>{pagination.total}</strong> results</>
              ) : (
                <>{products.length} results</>
              )}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort by:</span>
              <Link
                href={buildUrl(params, { sort: "createdAt", order: "desc" })}
                className={`px-3 py-1 rounded ${params.sort === "createdAt" || !params.sort ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
              >
                Newest
              </Link>
              <Link
                href={buildUrl(params, { sort: "price", order: "asc" })}
                className={`px-3 py-1 rounded ${params.sort === "price" && params.order === "asc" ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
              >
                Price: Low
              </Link>
              <Link
                href={buildUrl(params, { sort: "price", order: "desc" })}
                className={`px-3 py-1 rounded ${params.sort === "price" && params.order === "desc" ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
              >
                Price: High
              </Link>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No products found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => {
                const pid = product._id || product.id;
                const isAuction = product.productType === "auction";
                const price = isAuction
                  ? product.auctionCurrentPrice || product.auctionStartPrice || product.price
                  : product.price;

                return (
                  <Link key={pid} href={`/products/${pid}`} className="group">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                            📦
                          </div>
                        )}
                        {isAuction && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
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
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600">
                          {product.title}
                        </h3>
                        <p className="text-lg font-bold text-gray-900">
                          ${price?.toFixed(2)}
                        </p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</p>
                        )}
                        {product.freeShipping && (
                          <p className="text-xs text-green-600 font-medium mt-1">Free Shipping</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{product.sold} sold</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={buildUrl(params, { page: String(page - 1) })}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <Link
                    key={p}
                    href={buildUrl(params, { page: String(p) })}
                    className={`px-3 py-2 rounded-lg text-sm ${p === page ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}
                  >
                    {p}
                  </Link>
                );
              })}
              {page < pagination.totalPages && (
                <Link
                  href={buildUrl(params, { page: String(page + 1) })}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildUrl(current: SearchParams, overrides: Record<string, string | undefined>) {
  const merged = { ...current, ...overrides };
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== "") q.set(key, value);
  }
  return `/products?${q.toString()}`;
}
