import { User, IUser, Otp } from "../models";
import { ApiError } from "../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token";
import { sendOtpEmail } from "../utils/email";
import { TokenPayload } from "../types";
import crypto from "crypto";

export class AuthService {
  // ─── Register ───
  static async register(data: {
    name: string;
    email: string;
    password: string;
    role?: "buyer" | "seller";
  }) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw ApiError.conflict("User already exists with this email");
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || "buyer",
    });

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refreshToken to user document
    user.refreshToken = refreshToken;
    await user.save();

    // Send verification OTP
    try {
      await this.sendOtp(data.email, "verify");
    } catch {
      // Don't fail registration if OTP email fails
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  // ─── Login ───
  static async login(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.isBanned) {
      throw ApiError.forbidden(
        `Your account has been banned. Reason: ${user.banReason || "Contact support"}`
      );
    }

    if (user.isGoogleUser && !user.password) {
      throw ApiError.badRequest(
        "This account uses Google login. Please sign in with Google."
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  // ─── Google Auth ───
  static async googleAuth(googleData: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    let user = await User.findOne({
      $or: [{ googleId: googleData.googleId }, { email: googleData.email }],
    });

    if (user && user.isBanned) {
      throw ApiError.forbidden("Your account has been banned");
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

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  // ─── Refresh Token ───
  static async refreshToken(token: string) {
    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    if (user.isBanned) {
      throw ApiError.forbidden("Your account has been banned");
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ─── Logout ───
  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshToken: "" });
  }

  // ─── Get Profile ───
  static async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
  }

  // ─── Update Profile ───
  static async updateProfile(
    userId: string,
    data: Partial<IUser>
  ) {
    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
  }

  // ─── Helper: Generate 6-digit OTP ───
  private static generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // ─── Send OTP (for email verification or password reset) ───
  static async sendOtp(email: string, purpose: "verify" | "reset") {
    const user = await User.findOne({ email });

    if (purpose === "verify") {
      if (!user) throw ApiError.notFound("User not found with this email");
      if (user.isVerified) throw ApiError.badRequest("Email is already verified");
    }

    if (purpose === "reset") {
      if (!user) throw ApiError.notFound("No account found with this email");
    }

    // Delete any existing OTPs for this email + purpose
    await Otp.deleteMany({ email, purpose });

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.create({ email, otp, purpose, expiresAt });
    await sendOtpEmail(email, otp, purpose);

    return { message: `OTP sent to ${email}` };
  }

  // ─── Verify OTP (email verification) ───
  static async verifyOtp(email: string, otp: string) {
    const otpDoc = await Otp.findOne({ email, purpose: "verify" });

    if (!otpDoc) {
      throw ApiError.badRequest("OTP not found. Please request a new one.");
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      throw ApiError.badRequest("OTP has expired. Please request a new one.");
    }

    if (otpDoc.otp !== otp) {
      throw ApiError.badRequest("Invalid OTP");
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Clean up OTP
    await Otp.deleteMany({ email, purpose: "verify" });

    return {
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    };
  }

  // ─── Forgot Password (send reset OTP) ───
  static async forgotPassword(email: string) {
    return this.sendOtp(email, "reset");
  }

  // ─── Reset Password (with OTP) ───
  static async resetPassword(email: string, otp: string, newPassword: string) {
    const otpDoc = await Otp.findOne({ email, purpose: "reset" });

    if (!otpDoc) {
      throw ApiError.badRequest("OTP not found. Please request a new one.");
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      throw ApiError.badRequest("OTP has expired. Please request a new one.");
    }

    if (otpDoc.otp !== otp) {
      throw ApiError.badRequest("Invalid OTP");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    // Clean up OTP
    await Otp.deleteMany({ email, purpose: "reset" });

    return { message: "Password reset successfully" };
  }

  // ─── Change Password (authenticated user) ───
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (!user.password) {
      throw ApiError.badRequest(
        "This account uses Google login. Set a password from the forgot password page."
      );
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest("Current password is incorrect");
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    return { message: "Password changed successfully" };
  }
}
