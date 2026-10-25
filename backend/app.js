import express from "express";
import cors from "cors";
import multer from "multer";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import payslipRouter from "./routes/payslipRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";

import { serve } from "inngest/express";
import { functions, inngest } from "./inngest/index.js";

import {
    securityHeaders,
    generalLimiter,
    authLimiter
} from "./middlewares/rateLimiter.js";
import AppError from "./middlewares/AppError.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(securityHeaders);
app.use(cors());
app.use(express.json());
app.use(multer().none());

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register-organization", authLimiter);
app.use("/api", generalLimiter);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/payslip", payslipRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notifications", notificationRouter);

app.use((req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});
app.use(errorHandler);

export default app;
