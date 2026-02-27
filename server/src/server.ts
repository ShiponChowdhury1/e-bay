import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { corsOptions } from "./config/cors";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import routes from "./routes";

const app = express();

// ─── Middleware ───
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Rate Limiting ───
app.use("/api", apiLimiter);

// ─── Static files (uploads) ───
app.use("/uploads", express.static(env.UPLOAD_DIR));

// ─── Health Check ───
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "eBay Marketplace API is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───
app.use("/api/v1", routes);

// ─── 404 Handler ───
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Error Handler ───
app.use(errorHandler);

// ─── Start Server ───
const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║   🛒 eBay Marketplace API Server                ║
║   📡 Port: ${String(env.PORT).padEnd(37)}║
║   🌍 Environment: ${env.NODE_ENV.padEnd(30)}║
║   📅 Started: ${new Date().toLocaleString().padEnd(34)}║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
