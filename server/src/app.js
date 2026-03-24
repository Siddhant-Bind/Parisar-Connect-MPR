import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { configureSecurity } from "./middleware/security.middleware.js";

const app = express();

// 🔒 CRITICAL: Apply security middleware FIRST
configureSecurity(app);

// 🔒 CORS Configuration with validation
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ── Route imports ──────────────────────────────────────────
import authRouter from "./routes/auth.routes.js";
import residentRouter from "./routes/resident.routes.js";
import adminRouter from "./routes/admin.routes.js";
import visitorRouter from "./routes/visitor.routes.js";
import complaintRouter from "./routes/complaint.routes.js";
import noticeRouter from "./routes/notice.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import societyRouter from "./routes/society.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import reportRouter from "./routes/report.routes.js";

// ── Route declarations ─────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Parisar Connect API v1" });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/residents", residentRouter);
app.use("/api/v1/admins", adminRouter); // Guard management (Admin only)
app.use("/api/v1/visitors", visitorRouter);
app.use("/api/v1/complaints", complaintRouter);
app.use("/api/v1/notices", noticeRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/societies", societyRouter); // Society management
app.use("/api/v1/dashboard", dashboardRouter); // Dashboard stats
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/upload", uploadRouter); // Image uploads
app.use("/api/v1/reports", reportRouter); // Report analytics

// ── Global Error Handler ────────────────────────────────────
// Must be after all routes. Catches errors thrown via next(err) / asyncHandler.
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export { app };
