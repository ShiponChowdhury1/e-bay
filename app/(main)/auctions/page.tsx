import Link from "next/link";
import Image from "next/image";
import { getActiveAuctionsAction } from "@/actions/auction.actions";
import { ProductType } from "@/types";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface AuctionResponse {
  success: boolean;
  data?: ProductType[];
  message?: string;
}

export default async function AuctionsPage() {
  const res = (await getActiveAuctionsAction()) as AuctionResponse;
  const auctions = res.data || [];
  // Store current date at request time for time comparisons
  const requestDate = new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔥 Active Auctions
        </h1>
        <p className="text-gray-500">
          Bid on amazing items and get great deals!
        </p>
      </div>

      {auctions.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">No active auctions right now</p>
          <p className="text-gray-400 text-sm mb-4">Check back later for new listings</p>
          <Link href="/products" className="text-blue-600 hover:underline font-medium">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => {
            const pid = auction._id || auction.id;
            const currentPrice = auction.auctionCurrentPrice || auction.auctionStartPrice || auction.price;
            const endTime = auction.auctionEndTime ? new Date(auction.auctionEndTime) : null;
            const isEnding = endTime && endTime.getTime() - requestDate.getTime() < 24 * 60 * 60 * 1000;

            return (
              <Link key={pid} href={`/products/${pid}`} className="group">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {auction.images?.[0] ? (
                      <Image
                        src={auction.images[0]}
                        alt={auction.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        🏷️
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      AUCTION
                    </span>
                    {isEnding && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                        ENDING SOON
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition">
                      {auction.title}
                    </h3>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Current Bid</p>
                        <p className="text-2xl font-extrabold text-red-600">
                          ${currentPrice.toFixed(2)}
                        </p>
                      </div>
                      {endTime && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Ends</p>
                          <p className={`text-sm font-semibold ${isEnding ? "text-red-500" : "text-gray-700"}`}>
                            {endTime.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {endTime.toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">{auction.condition}</span>
                      <span>{auction.watchers || 0} watchers</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
