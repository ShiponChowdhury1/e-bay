import { Product, IProduct } from "../models";
import { ApiError } from "../utils/ApiError";

export class ProductService {
  // ─── Create Product ───
  static async create(data: Partial<IProduct> & { seller: string }) {
    // Generate slug from title
    const slug =
      data.title!
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();

    const product = await Product.create({
      ...data,
      slug,
      // Set auction fields if it's an auction
      ...(data.productType === "auction" && {
        auctionCurrentPrice: data.auctionStartPrice || data.price,
        auctionStatus: "active",
      }),
    });

    return product;
  }

  // ─── Get All Products (with filters & pagination) ───
  static async getAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    condition?: string;
    productType?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    order?: "asc" | "desc";
    seller?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      condition,
      productType,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      seller,
    } = query;

    const filter: Record<string, unknown> = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }
    if (condition) {
      filter.condition = condition;
    }
    if (productType) {
      filter.productType = productType;
    }
    if (seller) {
      filter.seller = seller;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = { [sort]: order === "desc" ? -1 : 1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .populate("seller", "name avatar")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
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

  // ─── Get Single Product ───
  static async getById(id: string) {
    const product = await Product.findById(id)
      .populate("category", "name slug")
      .populate("seller", "name avatar phone");

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    // Increment views
    product.views += 1;
    await product.save();

    return product;
  }

  // ─── Get by Slug ───
  static async getBySlug(slug: string) {
    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .populate("seller", "name avatar phone");

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    product.views += 1;
    await product.save();

    return product;
  }

  // ─── Update Product ───
  static async update(
    id: string,
    sellerId: string,
    data: Partial<IProduct>,
    isAdmin = false
  ) {
    const product = await Product.findById(id);

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    // Only seller or admin can update
    if (!isAdmin && product.seller.toString() !== sellerId) {
      throw ApiError.forbidden("You can only edit your own products");
    }

    Object.assign(product, data);
    await product.save();

    return product;
  }

  // ─── Delete Product ───
  static async delete(id: string, sellerId: string, isAdmin = false) {
    const product = await Product.findById(id);

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    if (!isAdmin && product.seller.toString() !== sellerId) {
      throw ApiError.forbidden("You can only delete your own products");
    }

    await Product.findByIdAndDelete(id);
    return { message: "Product deleted successfully" };
  }

  // ─── Get Featured Products ───
  static async getFeatured(limit = 10) {
    return Product.find({ isActive: true, isFeatured: true })
      .populate("category", "name slug")
      .populate("seller", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  // ─── Get Seller Products ───
  static async getSellerProducts(sellerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ seller: sellerId })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ seller: sellerId }),
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
}
