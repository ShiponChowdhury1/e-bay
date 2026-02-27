import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error in development
  if (env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  // Handle ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const mongooseErr = err as Error & { errors: Record<string, { message: string }> };
    const messages = Object.values(mongooseErr.errors).map(
      (e) => e.message
    );
    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
    return;
  }

  // Handle Mongoose duplicate key
  const mongoErr = err as Error & { code?: number; keyValue?: Record<string, unknown> };
  if (mongoErr.code === 11000) {
    const field = Object.keys(mongoErr.keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  // Default: Internal server error
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
