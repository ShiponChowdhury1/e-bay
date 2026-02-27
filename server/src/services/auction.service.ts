import { Bid, Product } from "../models";
import { ApiError } from "../utils/ApiError";

export class AuctionService {
  // ─── Place Bid ───
  static async placeBid(productId: string, bidderId: string, amount: number) {
    const product = await Product.findById(productId);

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    if (product.productType !== "auction") {
      throw ApiError.badRequest("This product is not an auction item");
    }

    if (product.auctionStatus !== "active") {
      throw ApiError.badRequest("This auction has ended");
    }

    if (product.auctionEndTime && new Date() > product.auctionEndTime) {
      // Auto-close auction
      product.auctionStatus = "ended";
      await product.save();
      throw ApiError.badRequest("This auction has ended");
    }

    if (product.seller.toString() === bidderId) {
      throw ApiError.badRequest("You cannot bid on your own product");
    }

    const currentPrice = product.auctionCurrentPrice || product.auctionStartPrice || product.price;
    if (amount <= currentPrice) {
      throw ApiError.badRequest(
        `Bid must be higher than the current price of $${currentPrice}`
      );
    }

    // Mark previous highest bid as not highest
    await Bid.updateMany(
      { product: productId, isHighest: true },
      { isHighest: false }
    );

    // Create new bid
    const bid = await Bid.create({
      product: productId,
      bidder: bidderId,
      amount,
      isHighest: true,
    });

    // Update product's current price
    product.auctionCurrentPrice = amount;
    await product.save();

    return bid;
  }

  // ─── Get Bid History ───
  static async getBidHistory(productId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      Bid.find({ product: productId })
        .populate("bidder", "name avatar")
        .sort({ amount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bid.countDocuments({ product: productId }),
    ]);

    return {
      bids,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Get Highest Bid ───
  static async getHighestBid(productId: string) {
    const bid = await Bid.findOne({ product: productId, isHighest: true })
      .populate("bidder", "name avatar");

    return bid;
  }

  // ─── Get Active Auctions ───
  static async getActiveAuctions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({
        productType: "auction",
        auctionStatus: "active",
        isActive: true,
        auctionEndTime: { $gt: new Date() },
      })
        .populate("category", "name slug")
        .populate("seller", "name avatar")
        .sort({ auctionEndTime: 1 }) // Ending soonest first
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({
        productType: "auction",
        auctionStatus: "active",
        isActive: true,
        auctionEndTime: { $gt: new Date() },
      }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Close Expired Auctions (run periodically) ───
  static async closeExpiredAuctions() {
    const expiredProducts = await Product.find({
      productType: "auction",
      auctionStatus: "active",
      auctionEndTime: { $lte: new Date() },
    });

    for (const product of expiredProducts) {
      product.auctionStatus = "ended";
      await product.save();
    }

    return { closed: expiredProducts.length };
  }

  // ─── Get User Bids ───
  static async getUserBids(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      Bid.find({ bidder: userId })
        .populate({
          path: "product",
          select: "title slug images auctionCurrentPrice auctionEndTime auctionStatus",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bid.countDocuments({ bidder: userId }),
    ]);

    return {
      bids,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
