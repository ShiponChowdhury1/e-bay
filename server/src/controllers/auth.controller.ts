import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../types";
import { setRefreshTokenCookie } from "../utils/token";

export class AuthController {
  // ─── Register ───
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);

      setRefreshTokenCookie(res, result.refreshToken);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Login ───
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      setRefreshTokenCookie(res, result.refreshToken);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Google Auth ───
  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { googleId, email, name, avatar } = req.body;
      const result = await AuthService.googleAuth({
        googleId,
        email,
        name,
        avatar,
      });

      setRefreshTokenCookie(res, result.refreshToken);

      res.json({
        success: true,
        message: "Google authentication successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Refresh Token ───
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Refresh token not found",
        });
        return;
      }

      const result = await AuthService.refreshToken(token);

      setRefreshTokenCookie(res, result.refreshToken);

      res.json({
        success: true,
        message: "Token refreshed",
        data: { accessToken: result.accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Logout ───
  static async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await AuthService.logout(req.user.userId);
      }

      res.clearCookie("refreshToken");
      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Profile ───
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.user!.userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Update Profile ───
  static async updateProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await AuthService.updateProfile(req.user!.userId, req.body);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Send OTP ───
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, purpose } = req.body;
      const result = await AuthService.sendOtp(email, purpose);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Verify OTP ───
  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyOtp(email, otp);

      res.json({
        success: true,
        message: result.message,
        data: { user: result.user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Forgot Password ───
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Reset Password ───
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await AuthService.resetPassword(email, otp, newPassword);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Change Password ───
  static async changePassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(
        req.user!.userId,
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
