import { Router } from "express";
import { AuctionController } from "../controllers/auction.controller";
import { verifyJWT } from "../middleware/verifyJWT";
import { validate } from "../middleware/validate";
import { bidLimiter } from "../middleware/rateLimiter";
import { placeBidSchema } from "../validators/order.validator";

const router = Router();

// Public routes
router.get("/active", AuctionController.getActiveAuctions);
router.get("/:productId/bids", AuctionController.getBidHistory);
router.get("/:productId/highest-bid", AuctionController.getHighestBid);

// Protected routes
router.post(
  "/:productId/bid",
  verifyJWT,
  bidLimiter,
  validate(placeBidSchema),
  AuctionController.placeBid
);

router.get("/my-bids", verifyJWT, AuctionController.getUserBids);

export default router;
