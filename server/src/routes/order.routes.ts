import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { verifyJWT } from "../middleware/verifyJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";
import { validate } from "../middleware/validate";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator";

const router = Router();

// All order routes require authentication
router.use(verifyJWT);

// Buyer routes
router.post("/", validate(createOrderSchema), OrderController.create);
router.get("/my-orders", OrderController.getBuyerOrders);

// Seller routes
router.get(
  "/seller/orders",
  authorizeRoles("seller", "admin"),
  OrderController.getSellerOrders
);

// Common routes
router.get("/:id", OrderController.getById);
router.patch(
  "/:id/status",
  authorizeRoles("seller", "admin"),
  validate(updateOrderStatusSchema),
  OrderController.updateStatus
);
router.patch("/:id/cancel", OrderController.cancel);

export default router;
