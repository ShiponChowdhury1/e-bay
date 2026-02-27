"use server";

import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

// ─── Import Mongoose Models (shared with backend) ───
// We re-define lightweight models here for the server action context
import mongoose from "mongoose";

// ─── User Schema (inline for server actions) ───
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["admin", "seller", "buyer"], default: "buyer" },
    googleId: { type: String, sparse: true },
    isGoogleUser: { type: Boolean, default: false },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

// ─── OTP Schema (inline for server actions) ───
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ["verify", "reset"], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);
otpSchema.index({ email: 1, purpose: 1 });
const OtpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);

// ─── Email Helper ───
const SMTP_EMAIL = process.env.SMTP_EMAIL || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: false,
    auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD },
  });
}

async function sendOtpEmail(to: string, otp: string, purpose: "verify" | "reset") {
  const subject =
    purpose === "verify" ? "Verify Your Email - eBay" : "Password Reset OTP - eBay";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
      <h2 style="color:#2563eb;text-align:center;margin-bottom:8px;">eBay</h2>
      <p style="color:#374151;text-align:center;font-size:16px;">
        ${purpose === "verify" ? "Verify your email address" : "Reset your password"}
      </p>
      <div style="background:#fff;border-radius:8px;padding:24px;margin:24px 0;text-align:center;border:1px solid #e5e7eb;">
        <p style="color:#6b7280;margin-bottom:12px;font-size:14px;">Your OTP code is:</p>
        <h1 style="color:#1f2937;letter-spacing:8px;font-size:36px;margin:0;">${otp}</h1>
      </div>
      <p style="color:#9ca3af;text-align:center;font-size:13px;">
        This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
      </p>
    </div>`;
  await getTransporter().sendMail({
    from: `"eBay" <${SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
}

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ─── Helper: serialize user for client ───
function serializeUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name || "",
    email: user.email || "",
    role: user.role || "buyer",
    avatar: user.avatar || "",
    phone: user.phone || "",
    address: user.address
      ? {
          street: user.address.street || "",
          city: user.address.city || "",
          state: user.address.state || "",
          zipCode: user.address.zipCode || "",
          country: user.address.country || "",
        }
      : null,
  };
}

// ─── JWT Helpers ───
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";

function generateAccessToken(payload: { userId: string; email: string; role: string }) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(payload: { userId: string; email: string; role: string }) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

// ─── Register Action ───
export async function registerAction(formData: {
  name: string;
  email: string;
  password: string;
  role?: "buyer" | "seller";
}) {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email: formData.email });
    if (existingUser) {
      return { success: false, message: "User already exists with this email" };
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(formData.password, salt);

    const user = await User.create({
      name: formData.name,
      email: formData.email,
      password: hashedPassword,
      role: formData.role || "buyer",
    });

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    await User.findByIdAndUpdate(user._id, { refreshToken });

    // Send verification OTP
    try {
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await OtpModel.deleteMany({ email: user.email, purpose: "verify" });
      await OtpModel.create({ email: user.email, otp, purpose: "verify", expiresAt });
      await sendOtpEmail(user.email, otp, "verify");
    } catch {
      // Don't fail registration if OTP email fails
    }

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return {
      success: true,
      message: "Registration successful",
      data: {
        user: serializeUser(user),
        accessToken,
      },
    };
  } catch (error: any) {
    console.error("Register error:", error);
    return { success: false, message: error.message || "Registration failed" };
  }
}

// ─── Login Action ───
export async function loginAction(formData: {
  email: string;
  password: string;
}) {
  try {
    await connectDB();

    const user = await User.findOne({ email: formData.email }).select("+password");
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    if (user.isBanned) {
      return {
        success: false,
        message: `Your account has been banned. ${user.banReason || "Contact support."}`,
      };
    }

    if (user.isGoogleUser && !user.password) {
      return {
        success: false,
        message: "This account uses Google login. Please sign in with Google.",
      };
    }

    const isMatch = await bcrypt.compare(formData.password, user.password);
    if (!isMatch) {
      return { success: false, message: "Invalid email or password" };
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await User.findByIdAndUpdate(user._id, { refreshToken });

    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return {
      success: true,
      message: "Login successful",
      data: {
        user: serializeUser(user),
        accessToken,
      },
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, message: error.message || "Login failed" };
  }
}

// ─── Google Auth Action ───
export async function googleAuthAction(googleData: {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}) {
  try {
    await connectDB();

    let user = await User.findOne({
      $or: [{ googleId: googleData.googleId }, { email: googleData.email }],
    });

    if (user && user.isBanned) {
      return { success: false, message: "Your account has been banned" };
    }

    if (!user) {
      user = await User.create({
        name: googleData.name,
        email: googleData.email,
        googleId: googleData.googleId,
        isGoogleUser: true,
        avatar: googleData.avatar || "",
        role: "buyer",
      });
    } else if (!user.googleId) {
      user.googleId = googleData.googleId;
      user.isGoogleUser = true;
      if (googleData.avatar) user.avatar = googleData.avatar;
      await user.save();
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await User.findByIdAndUpdate(user._id, { refreshToken });

    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return {
      success: true,
      message: "Google authentication successful",
      data: {
        user: serializeUser(user),
        accessToken,
      },
    };
  } catch (error: any) {
    console.error("Google auth error:", error);
    return { success: false, message: error.message || "Google authentication failed" };
  }
}

// ─── Refresh Token Action ───
export async function refreshTokenAction() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("refreshToken")?.value;

    if (!token) {
      return { success: false, message: "No refresh token" };
    }

    const decoded = jwt.verify(token, REFRESH_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      return { success: false, message: "Invalid refresh token" };
    }

    if (user.isBanned) {
      return { success: false, message: "Account is banned" };
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await User.findByIdAndUpdate(user._id, { refreshToken });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return {
      success: true,
      data: {
        accessToken,
        user: serializeUser(user),
      },
    };
  } catch (error: any) {
    return { success: false, message: "Token refresh failed" };
  }
}

// ─── Logout Action ───
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("refreshToken")?.value;

    if (token) {
      await connectDB();
      const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };
      await User.findByIdAndUpdate(decoded.userId, { refreshToken: "" });
    }

    cookieStore.delete("refreshToken");

    return { success: true, message: "Logged out successfully" };
  } catch {
    const cookieStore = await cookies();
    cookieStore.delete("refreshToken");
    return { success: true, message: "Logged out" };
  }
}

// ─── Get Current User Action ───
export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("refreshToken")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    await connectDB();

    const decoded = jwt.verify(token, REFRESH_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.userId);
    if (!user || user.isBanned) {
      return { success: false, message: "User not found or banned" };
    }

    return {
      success: true,
      data: {
        user: serializeUser(user),
      },
    };
  } catch {
    return { success: false, message: "Not authenticated" };
  }
}

// ─── Update Profile Action ───
export async function updateProfileAction(data: {
  name?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("refreshToken")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    await connectDB();

    const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };

    const user = await User.findByIdAndUpdate(decoded.userId, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      message: "Profile updated",
      data: {
        user: serializeUser(user),
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Update failed" };
  }
}

// ─── Update Avatar Action ───
export async function updateAvatarAction(base64Image: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("refreshToken")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    await connectDB();

    const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };

    // Validate base64
    const match = base64Image.match(/^data:image\/(png|jpe?g|gif|webp);base64,([\s\S]+)$/);
    if (!match) {
      return { success: false, message: "Invalid image format. Use PNG, JPG, GIF or WebP." };
    }

    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const imageData = match[2];
    const buffer = Buffer.from(imageData, "base64");

    // Max 2MB
    if (buffer.length > 2 * 1024 * 1024) {
      return { success: false, message: "Image must be less than 2MB" };
    }

    // Save to public/uploads/avatars/
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${decoded.userId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;

    // Delete old avatar file if exists
    const oldUser = await User.findById(decoded.userId);
    if (oldUser?.avatar && oldUser.avatar.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), "public", oldUser.avatar);
      try { fs.unlinkSync(oldPath); } catch { /* ignore */ }
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      message: "Avatar updated successfully",
      data: { user: serializeUser(user) },
    };
  } catch (error: any) {
    console.error("Update avatar error:", error);
    return { success: false, message: error.message || "Failed to update avatar" };
  }
}

// ─── Send OTP Action ───
export async function sendOtpAction(data: {
  email: string;
  purpose: "verify" | "reset";
}) {
  try {
    await connectDB();

    const user = await User.findOne({ email: data.email });

    if (data.purpose === "verify") {
      if (!user) return { success: false, message: "User not found" };
      if (user.isVerified)
        return { success: false, message: "Email is already verified" };
    }

    if (data.purpose === "reset") {
      if (!user) return { success: false, message: "No account found with this email" };
    }

    // Delete existing OTPs
    await OtpModel.deleteMany({ email: data.email, purpose: data.purpose });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpModel.create({
      email: data.email,
      otp,
      purpose: data.purpose,
      expiresAt,
    });

    await sendOtpEmail(data.email, otp, data.purpose);

    return { success: true, message: `OTP sent to ${data.email}` };
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return { success: false, message: error.message || "Failed to send OTP" };
  }
}

// ─── Verify OTP Action ───
export async function verifyOtpAction(data: { email: string; otp: string }) {
  try {
    await connectDB();

    const otpDoc = await OtpModel.findOne({ email: data.email, purpose: "verify" });

    if (!otpDoc) {
      return { success: false, message: "OTP not found. Please request a new one." };
    }

    if (otpDoc.expiresAt < new Date()) {
      await OtpModel.deleteOne({ _id: otpDoc._id });
      return { success: false, message: "OTP has expired. Please request a new one." };
    }

    if (otpDoc.otp !== data.otp) {
      return { success: false, message: "Invalid OTP" };
    }

    const user = await User.findOneAndUpdate(
      { email: data.email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    await OtpModel.deleteMany({ email: data.email, purpose: "verify" });

    return {
      success: true,
      message: "Email verified successfully",
      data: { user: serializeUser(user) },
    };
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return { success: false, message: error.message || "Verification failed" };
  }
}

// ─── Forgot Password Action ───
export async function forgotPasswordAction(data: { email: string }) {
  try {
    await connectDB();

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return { success: false, message: "No account found with this email" };
    }

    // Delete existing reset OTPs
    await OtpModel.deleteMany({ email: data.email, purpose: "reset" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpModel.create({
      email: data.email,
      otp,
      purpose: "reset",
      expiresAt,
    });

    await sendOtpEmail(data.email, otp, "reset");

    return { success: true, message: `Password reset OTP sent to ${data.email}` };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return { success: false, message: error.message || "Failed to send reset OTP" };
  }
}

// ─── Reset Password Action ───
export async function resetPasswordAction(data: {
  email: string;
  newPassword: string;
}) {
  try {
    await connectDB();

    const user = await User.findOne({ email: data.email }).select("+password");
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(data.newPassword, salt);
    await user.save();

    // Clean up any remaining OTPs
    await OtpModel.deleteMany({ email: data.email, purpose: "reset" });

    return { success: true, message: "Password reset successfully" };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { success: false, message: error.message || "Password reset failed" };
  }
}

// ─── Verify Reset OTP Action (just verify, don't reset password) ───
export async function verifyResetOtpAction(data: { email: string; otp: string }) {
  try {
    await connectDB();

    const otpDoc = await OtpModel.findOne({ email: data.email, purpose: "reset" });

    if (!otpDoc) {
      return { success: false, message: "OTP not found. Please request a new one." };
    }

    if (otpDoc.expiresAt < new Date()) {
      await OtpModel.deleteOne({ _id: otpDoc._id });
      return { success: false, message: "OTP has expired. Please request a new one." };
    }

    if (otpDoc.otp !== data.otp) {
      return { success: false, message: "Invalid OTP" };
    }

    // Delete the OTP after successful verification
    await OtpModel.deleteMany({ email: data.email, purpose: "reset" });

    return { success: true, message: "OTP verified successfully" };
  } catch (error: any) {
    console.error("Verify reset OTP error:", error);
    return { success: false, message: error.message || "OTP verification failed" };
  }
}

// ─── Change Password Action ───
export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("refreshToken")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    await connectDB();

    const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select("+password");

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.password) {
      return {
        success: false,
        message: "This account uses Google login. Set a password from the forgot password page.",
      };
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      return { success: false, message: "Current password is incorrect" };
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(data.newPassword, salt);
    await user.save();

    return { success: true, message: "Password changed successfully" };
  } catch (error: any) {
    console.error("Change password error:", error);
    return { success: false, message: error.message || "Password change failed" };
  }
}
