"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { getMyBidsAction } from "@/actions/auction.actions";
import { BidType, ProductType } from "@/types";

interface BidsResponse {
  success: boolean;
  data?: BidType[];
}

export default function MyBidsPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [bids, setBids] = useState<BidType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchBids = async () => {
      const res = (await getMyBidsAction()) as BidsResponse;
      if (res.success) {
        setBids(res.data || []);
      }
      setLoading(false);
    };
    fetchBids();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bids</h1>

      {bids.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">You haven&apos;t placed any bids yet</p>
          <Link href="/auctions" className="text-blue-600 hover:underline font-medium">
            Browse Auctions
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => {
            const product = bid.product as ProductType;
            const pid = product?._id || product?.id || (bid.product as string);

            return (
              <div key={bid._id} className="bg-white rounded-xl border p-5 hover:shadow-md transition">
                <div className="flex gap-4">
                  {product && typeof product !== "string" && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">🏷️</div>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    {product && typeof product !== "string" ? (
                      <Link href={`/products/${pid}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {product.title}
                      </Link>
                    ) : (
                      <p className="font-medium text-gray-900">Product #{String(pid).slice(-8)}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Your Bid</p>
                        <p className="text-xl font-extrabold text-blue-600">${bid.amount.toFixed(2)}</p>
                      </div>
                      {bid.isHighest && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          HIGHEST BID
                        </span>
                      )}
                      {!bid.isHighest && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                          OUTBID
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Placed: {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Link
                      href={`/products/${pid}`}
                      className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition"
                    >
                      View Auction
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
