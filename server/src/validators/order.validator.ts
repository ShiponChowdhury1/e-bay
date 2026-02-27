import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          product: z.string().min(1, "Product ID is required"),
          quantity: z.number().min(1, "Quantity must be at least 1"),
        })
      )
      .min(1, "At least one item is required"),
    shippingAddress: z.object({
      fullName: z.string().min(1, "Full name is required"),
      street: z.string().min(1, "Street is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zipCode: z.string().min(1, "Zip code is required"),
      country: z.string().min(1, "Country is required"),
      phone: z.string().min(1, "Phone is required"),
    }),
    paymentMethod: z.string().default("card"),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum([
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ]),
    trackingNumber: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const placeBidSchema = z.object({
  body: z.object({
    amount: z.number().min(0.01, "Bid must be greater than 0"),
  }),
  params: z.object({
    productId: z.string().min(1),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type PlaceBidInput = z.infer<typeof placeBidSchema>["body"];
