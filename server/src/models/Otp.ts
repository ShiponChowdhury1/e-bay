import mongoose, { Document, Schema, Model } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: "verify" | "reset";
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["verify", "reset"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: auto-delete when expired
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ email: 1, purpose: 1 });

const Otp: Model<IOtp> = mongoose.model<IOtp>("Otp", otpSchema);
export default Otp;
