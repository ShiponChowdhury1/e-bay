import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types";

export const verifyJWT = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Access token is required");
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    if (err.name === "JsonWebTokenError") {
      next(ApiError.unauthorized("Invalid access token"));
    } else if (err.name === "TokenExpiredError") {
      next(ApiError.unauthorized("Access token expired"));
    } else {
      next(error);
    }
  }
};
