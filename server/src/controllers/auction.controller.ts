import { Request, Response, NextFunction } from "express";
import { AuctionService } from "../services/auction.service";
import { AuthRequest } from "../types";

export class AuctionController {
  // ─── Place Bid ───
  static async placeBid(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bid = await AuctionService.placeBid(
        req.params.productId,
        req.user!.userId,
        req.body.amount
      );

      res.status(201).json({
        success: true,
        message: "Bid placed successfully",
        data: { bid },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Bid History ───
  static async getBidHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuctionService.getBidHistory(
        req.params.productId,
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );

      res.json({
        success: true,
        data: result.bids,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Highest Bid ───
  static async getHighestBid(req: Request, res: Response, next: NextFunction) {
    try {
      const bid = await AuctionService.getHighestBid(req.params.productId);

      res.json({
        success: true,
        data: { bid },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Active Auctions ───
  static async getActiveAuctions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await AuctionService.getActiveAuctions(
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get User Bids ───
  static async getUserBids(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await AuctionService.getUserBids(
        req.user!.userId,
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );

      res.json({
        success: true,
        data: result.bids,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
