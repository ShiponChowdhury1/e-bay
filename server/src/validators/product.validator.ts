import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be at most 200 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000),
    price: z.number().min(0, "Price must be a positive number"),
    originalPrice: z.number().min(0).optional(),
    category: z.string().min(1, "Category is required"),
    condition: z.enum(["new", "used", "refurbished"]),
    productType: z.enum(["auction", "buy_now"]).default("buy_now"),
    stock: z.number().min(0).default(1),
    tags: z.array(z.string()).optional(),
    shippingCost: z.number().min(0).default(0),
    freeShipping: z.boolean().default(false),
    shippingInfo: z.string().optional(),
    specifications: z.record(z.string(), z.string()).optional(),
    // Auction fields
    auctionStartPrice: z.number().min(0).optional(),
    auctionEndTime: z.string().datetime().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.number().min(0).optional(),
    originalPrice: z.number().min(0).optional(),
    condition: z.enum(["new", "used", "refurbished"]).optional(),
    stock: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    shippingCost: z.number().min(0).optional(),
    freeShipping: z.boolean().optional(),
    shippingInfo: z.string().optional(),
    specifications: z.record(z.string(), z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("20"),
    search: z.string().optional(),
    category: z.string().optional(),
    condition: z.enum(["new", "used", "refurbished"]).optional(),
    productType: z.enum(["auction", "buy_now"]).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    sort: z.string().optional().default("createdAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
