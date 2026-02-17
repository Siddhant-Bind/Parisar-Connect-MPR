import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import noticeRouter from "./routes/notice.routes.js"; // Keep for public read access if needed
import adminRouter from "./routes/admin.routes.js";
import complaintRouter from "./routes/complaint.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import visitorRouter from "./routes/visitor.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notices", noticeRouter); // Public access to read notices
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/complaints", complaintRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/visitors", visitorRouter);

export { app };
