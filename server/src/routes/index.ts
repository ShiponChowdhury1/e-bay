import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import auctionRoutes from "./auction.routes";
import orderRoutes from "./order.routes";
import adminRoutes from "./admin.routes";
import paymentRoutes from "./payment.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/auctions", auctionRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/payments", paymentRoutes);

export default router;
