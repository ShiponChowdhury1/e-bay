import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { AuthRequest } from "../types";

export class ProductController {
  // ─── Create Product ───
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.create({
        ...req.body,
        seller: req.user!.userId,
        images: req.body.images || [],
      });

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get All Products ───
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getAll({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        category: req.query.category as string,
        condition: req.query.condition as string,
        productType: req.query.productType as string,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        sort: req.query.sort as string,
        order: req.query.order as "asc" | "desc",
      });

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Single Product ───
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getById(req.params.id);

      res.json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Product by Slug ───
  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getBySlug(req.params.slug);

      res.json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Update Product ───
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === "admin";
      const product = await ProductService.update(
        req.params.id,
        req.user!.userId,
        req.body,
        isAdmin
      );

      res.json({
        success: true,
        message: "Product updated successfully",
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Delete Product ───
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === "admin";
      const result = await ProductService.delete(
        req.params.id,
        req.user!.userId,
        isAdmin
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Featured Products ───
  static async getFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const products = await ProductService.getFeatured(limit);

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Seller Products ───
  static async getSellerProducts(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await ProductService.getSellerProducts(
        req.user!.userId,
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
}
