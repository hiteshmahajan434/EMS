import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";

import connectDB from "./config/db.js";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import payslipRouter from "./routes/payslipRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

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
const PORT = process.env.PORT || 4000;

// Security headers
app.use(securityHeaders);

// CORS
app.use(cors());

// Request parsing
app.use(express.json());
app.use(multer().none());

// Health check
app.get("/", (req, res) => {
    res.send("Server is running");
});

// Inngest endpoint
app.use("/api/inngest", serve({ client: inngest, functions }));

// Strict rate limits for authentication endpoints
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register-organization", authLimiter);

// General rate limit for API requests
app.use("/api", generalLimiter);

// Application routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/payslip", payslipRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});
app.use(errorHandler);

// Connect to database and start server
await connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});