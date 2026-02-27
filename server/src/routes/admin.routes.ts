import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { verifyJWT } from "../middleware/verifyJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyJWT, authorizeRoles("admin"));

// User management
router.get("/users", AdminController.getAllUsers);
router.patch("/users/:id/ban", AdminController.banUser);
router.patch("/users/:id/unban", AdminController.unbanUser);
router.patch("/users/:id/role", AdminController.changeUserRole);

// Product management
router.get("/products", AdminController.getAllProducts);
router.patch("/products/:id/toggle-status", AdminController.toggleProductStatus);

// Statistics
router.get("/statistics", AdminController.getStatistics);

// Category management
router.get("/categories", AdminController.getAllCategories);
router.post("/categories", AdminController.createCategory);
router.put("/categories/:id", AdminController.updateCategory);
router.delete("/categories/:id", AdminController.deleteCategory);

export default router;
