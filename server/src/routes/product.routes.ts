import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { verifyJWT } from "../middleware/verifyJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator";

const router = Router();

// Public routes
router.get("/", ProductController.getAll);
router.get("/featured", ProductController.getFeatured);
router.get("/slug/:slug", ProductController.getBySlug);
router.get("/:id", ProductController.getById);

// Protected routes (seller/admin only)
router.post(
  "/",
  verifyJWT,
  authorizeRoles("seller", "admin"),
  validate(createProductSchema),
  ProductController.create
);

router.put(
  "/:id",
  verifyJWT,
  authorizeRoles("seller", "admin"),
  validate(updateProductSchema),
  ProductController.update
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeRoles("seller", "admin"),
  ProductController.delete
);

// Seller dashboard - get own products
router.get(
  "/seller/my-products",
  verifyJWT,
  authorizeRoles("seller", "admin"),
  ProductController.getSellerProducts
);

export default router;
