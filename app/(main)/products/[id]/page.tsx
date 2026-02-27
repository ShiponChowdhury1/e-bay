import Link from "next/link";
import { getProductByIdAction } from "@/actions/product.actions";
import { getBidHistoryAction } from "@/actions/auction.actions";
import { ProductType, BidType } from "@/types";
import AddToCartButton from "./AddToCartButton";
import PlaceBidForm from "./PlaceBidForm";

interface BidsResponse {
  success: boolean;
  data?: BidType[];
}

interface Seller {
  name: string;
  avatar?: string;
  phone?: string;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getProductByIdAction(id);

  if (!res.success || !res.data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
        <p className="text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/products" className="text-blue-600 hover:underline">
          Browse Products
        </Link>
      </div>
    );
  }

  const product = res.data as ProductType;
  const isAuction = product.productType === "auction";

  let bids: BidType[] = [];
  if (isAuction) {
    const bidsRes = (await getBidHistoryAction(id)) as BidsResponse;
    bids = bidsRes.data || [];
  }

  const pid = product._id || product.id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-600">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                📦
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 cursor-pointer">
                  <img src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start gap-3 mb-2">
            {isAuction && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">AUCTION</span>
            )}
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
              {product.condition}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {product.title}
          </h1>

          {/* Seller */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
              {((product.seller as Seller)?.name?.charAt(0)) || "S"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{(product.seller as Seller)?.name}</p>
              <p className="text-xs text-gray-500">Seller</p>
            </div>
          </div>

          {/* Price / Auction */}
          {isAuction ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm text-gray-500">Current Bid</p>
                  <p className="text-3xl font-extrabold text-red-600">
                    ${(product.auctionCurrentPrice || product.auctionStartPrice || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Bids</p>
                  <p className="text-lg font-bold">{bids.length}</p>
                </div>
              </div>
              {product.auctionEndTime && (
                <p className="text-sm text-gray-600">
                  Ends: <strong>{new Date(product.auctionEndTime).toLocaleString()}</strong>
                </p>
              )}
              <PlaceBidForm
                productId={pid}
                currentPrice={product.auctionCurrentPrice || product.auctionStartPrice || 0}
              />
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-extrabold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <p className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</p>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Shipping */}
              <div className="mt-3">
                {product.freeShipping ? (
                  <p className="text-sm text-green-600 font-medium">✓ Free Shipping</p>
                ) : (
                  <p className="text-sm text-gray-500">Shipping: ${product.shippingCost?.toFixed(2)}</p>
                )}
              </div>

              {/* Stock */}
              <p className="text-sm text-gray-500 mt-2">
                {product.stock > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </p>

              {/* Add to Cart */}
              {product.stock > 0 && <AddToCartButton product={product} />}
            </div>
          )}

          {/* Description */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-500 font-medium capitalize">{key}</td>
                      <td className="py-2 text-gray-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bid History for Auctions */}
      {isAuction && bids.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bid History ({bids.length} bids)</h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Bidder</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid, i) => (
                  <tr key={bid._id} className={`border-t ${i === 0 ? "bg-green-50" : ""}`}>
                    <td className="px-4 py-3">
                      <span className="font-medium">{bid.bidder?.name || "Anonymous"}</span>
                      {i === 0 && <span className="ml-2 text-xs text-green-600 font-bold">HIGHEST</span>}
                    </td>
                    <td className="px-4 py-3 font-bold">${bid.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(bid.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
