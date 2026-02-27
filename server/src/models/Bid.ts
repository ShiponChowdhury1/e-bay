import mongoose, { Document, Schema, Model } from "mongoose";

// ─── Interface ───
export interface IBid extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  bidder: mongoose.Types.ObjectId;
  amount: number;
  isHighest: boolean;
  isAutoBid: boolean;
  maxAutoBidAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───
const bidSchema = new Schema<IBid>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    bidder: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Bidder is required"],
    },
    amount: {
      type: Number,
      required: [true, "Bid amount is required"],
      min: [0.01, "Bid must be greater than 0"],
    },
    isHighest: {
      type: Boolean,
      default: false,
    },
    isAutoBid: {
      type: Boolean,
      default: false,
    },
    maxAutoBidAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───
bidSchema.index({ product: 1, amount: -1 });
bidSchema.index({ bidder: 1 });
bidSchema.index({ product: 1, createdAt: -1 });

export const Bid: Model<IBid> =
  mongoose.models.Bid || mongoose.model<IBid>("Bid", bidSchema);
