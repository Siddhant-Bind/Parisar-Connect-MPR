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
  : ["http://localhost:5173"]; // Default for development

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
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

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import noticeRouter from "./routes/notice.routes.js";
import adminRouter from "./routes/admin.routes.js";
import complaintRouter from "./routes/complaint.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import visitorRouter from "./routes/visitor.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notices", noticeRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/complaints", complaintRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/visitors", visitorRouter);

export { app };
