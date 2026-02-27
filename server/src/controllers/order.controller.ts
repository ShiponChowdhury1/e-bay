import { Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { AuthRequest } from "../types";

export class OrderController {
  // ─── Create Order ───
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.create(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Buyer Orders ───
  static async getBuyerOrders(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await OrderService.getBuyerOrders(
        req.user!.userId,
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Seller Orders ───
  static async getSellerOrders(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await OrderService.getSellerOrders(
        req.user!.userId,
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Single Order ───
  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === "admin";
      const order = await OrderService.getById(
        req.params.id,
        req.user!.userId,
        isAdmin
      );

      res.json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Update Order Status ───
  static async updateStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const isAdmin = req.user!.role === "admin";
      const order = await OrderService.updateStatus(
        req.params.id,
        req.user!.userId,
        req.body,
        isAdmin
      );

      res.json({
        success: true,
        message: "Order status updated",
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Cancel Order ───
  static async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.cancel(
        req.params.id,
        req.user!.userId
      );

      res.json({
        success: true,
        message: "Order cancelled",
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}
