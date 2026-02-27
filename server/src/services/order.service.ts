import { Order, Product } from "../models";
import { ApiError } from "../utils/ApiError";
import { CreateOrderInput } from "../validators/order.validator";

export class OrderService {
  // ─── Create Order ───
  static async create(buyerId: string, data: CreateOrderInput) {
    // Gather product details and validate stock
    const orderItems = [];
    let totalAmount = 0;
    let shippingCost = 0;
    let sellerId = "";

    for (const item of data.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw ApiError.notFound(`Product ${item.product} not found`);
      }
      if (!product.isActive) {
        throw ApiError.badRequest(`Product "${product.title}" is not available`);
      }
      if (product.productType === "auction") {
        throw ApiError.badRequest(
          `"${product.title}" is an auction item. Use bidding instead.`
        );
      }
      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${product.title}". Available: ${product.stock}`
        );
      }

      // All items in one order must be from the same seller (simplified)
      if (!sellerId) {
        sellerId = product.seller.toString();
      }

      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || "",
      });

      totalAmount += product.price * item.quantity;
      if (!product.freeShipping) {
        shippingCost += product.shippingCost;
      }
    }

    const tax = totalAmount * 0.08; // 8% tax
    const grandTotal = totalAmount + shippingCost + tax;

    // Create order
    const order = await Order.create({
      buyer: buyerId,
      seller: sellerId,
      items: orderItems,
      totalAmount,
      shippingCost,
      tax: Math.round(tax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      orderStatus: "pending",
      paymentStatus: "pending",
    });

    // Update stock for each product
    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    return order;
  }

  // ─── Get Orders for Buyer ───
  static async getBuyerOrders(buyerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ buyer: buyerId })
        .populate("seller", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ buyer: buyerId }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Get Orders for Seller ───
  static async getSellerOrders(sellerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ seller: sellerId })
        .populate("buyer", "name avatar email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ seller: sellerId }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Get Single Order ───
  static async getById(orderId: string, userId: string, isAdmin = false) {
    const order = await Order.findById(orderId)
      .populate("buyer", "name avatar email")
      .populate("seller", "name avatar email");

    if (!order) {
      throw ApiError.notFound("Order not found");
    }

    // Only buyer, seller, or admin can view
    if (
      !isAdmin &&
      order.buyer._id.toString() !== userId &&
      order.seller._id.toString() !== userId
    ) {
      throw ApiError.forbidden("Access denied");
    }

    return order;
  }

  // ─── Update Order Status ───
  static async updateStatus(
    orderId: string,
    userId: string,
    data: { orderStatus: string; trackingNumber?: string },
    isAdmin = false
  ) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw ApiError.notFound("Order not found");
    }

    // Only seller or admin can update status
    if (!isAdmin && order.seller.toString() !== userId) {
      throw ApiError.forbidden("Only the seller can update order status");
    }

    order.orderStatus = data.orderStatus as typeof order.orderStatus;
    if (data.trackingNumber) {
      order.trackingNumber = data.trackingNumber;
    }

    // If confirmed, mark as paid
    if (data.orderStatus === "confirmed") {
      order.paymentStatus = "paid";
    }

    await order.save();
    return order;
  }

  // ─── Cancel Order ───
  static async cancel(orderId: string, userId: string) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw ApiError.notFound("Order not found");
    }

    if (
      order.buyer.toString() !== userId &&
      order.seller.toString() !== userId
    ) {
      throw ApiError.forbidden("Access denied");
    }

    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      throw ApiError.badRequest("Cannot cancel a shipped or delivered order");
    }

    order.orderStatus = "cancelled";
    order.paymentStatus = "refunded";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    return order;
  }
}
