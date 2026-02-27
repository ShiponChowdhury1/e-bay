import { User, Product, Order, Bid, Category } from "../models";
import { ApiError } from "../utils/ApiError";

export class AdminService {
  // ─── Get All Users ───
  static async getAllUsers(page = 1, limit = 20, role?: string) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Ban User ───
  static async banUser(userId: string, reason: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    if (user.role === "admin") throw ApiError.forbidden("Cannot ban an admin");

    user.isBanned = true;
    user.banReason = reason;
    user.refreshToken = "";
    await user.save();

    return user;
  }

  // ─── Unban User ───
  static async unbanUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    user.isBanned = false;
    user.banReason = undefined;
    await user.save();

    return user;
  }

  // ─── Change User Role ───
  static async changeUserRole(userId: string, role: "admin" | "seller" | "buyer") {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  // ─── Get All Products (admin view, includes inactive) ───
  static async getAllProducts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .populate("category", "name slug")
        .populate("seller", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(),
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

  // ─── Toggle Product Active Status ───
  static async toggleProductStatus(productId: string) {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound("Product not found");

    product.isActive = !product.isActive;
    await product.save();

    return product;
  }

  // ─── Get Platform Statistics ───
  static async getStatistics() {
    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalProducts,
      totalOrders,
      totalBids,
      activeAuctions,
      bannedUsers,
      salesAggregation,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "buyer" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Bid.countDocuments(),
      Product.countDocuments({
        productType: "auction",
        auctionStatus: "active",
      }),
      User.countDocuments({ isBanned: true }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$grandTotal" },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const sales = salesAggregation[0] || { totalSales: 0, totalOrders: 0 };

    // Monthly sales (last 12 months)
    const monthlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return {
      users: {
        total: totalUsers,
        sellers: totalSellers,
        buyers: totalBuyers,
        banned: bannedUsers,
      },
      products: {
        total: totalProducts,
        activeAuctions,
      },
      orders: {
        total: totalOrders,
        paid: sales.totalOrders,
      },
      bids: {
        total: totalBids,
      },
      revenue: {
        totalSales: sales.totalSales,
      },
      monthlySales,
    };
  }

  // ─── Manage Categories ───
  static async createCategory(data: {
    name: string;
    description?: string;
    image?: string;
    parent?: string;
  }) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await Category.create({ ...data, slug });
    return category;
  }

  static async updateCategory(
    id: string,
    data: { name?: string; description?: string; image?: string; isActive?: boolean }
  ) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.name) {
      updateData.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!category) throw ApiError.notFound("Category not found");
    return category;
  }

  static async deleteCategory(id: string) {
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete category with ${productsCount} products`
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) throw ApiError.notFound("Category not found");
    return { message: "Category deleted successfully" };
  }

  static async getAllCategories() {
    return Category.find().sort({ name: 1 }).lean();
  }
}
