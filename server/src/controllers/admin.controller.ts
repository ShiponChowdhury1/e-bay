import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";

export class AdminController {
  // ─── Get All Users ───
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAllUsers(
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20,
        req.query.role as string
      );

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Ban User ───
  static async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.banUser(
        req.params.id,
        req.body.reason || "Violation of terms"
      );

      res.json({
        success: true,
        message: "User banned successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Unban User ───
  static async unbanUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.unbanUser(req.params.id);

      res.json({
        success: true,
        message: "User unbanned successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Change User Role ───
  static async changeUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.changeUserRole(
        req.params.id,
        req.body.role
      );

      res.json({
        success: true,
        message: "User role updated",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get All Products ───
  static async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAllProducts(
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

  // ─── Toggle Product Status ───
  static async toggleProductStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const product = await AdminService.toggleProductStatus(req.params.id);

      res.json({
        success: true,
        message: `Product ${product.isActive ? "activated" : "deactivated"}`,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Statistics ───
  static async getStatistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getStatistics();

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Category Management ───
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await AdminService.createCategory(req.body);

      res.status(201).json({
        success: true,
        message: "Category created",
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await AdminService.updateCategory(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        message: "Category updated",
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.deleteCategory(req.params.id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllCategories(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const categories = await AdminService.getAllCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}
