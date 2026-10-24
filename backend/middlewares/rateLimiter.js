import helmet from "helmet";
import rateLimit from "express-rate-limit";
import AppError from "./AppError.js";

const handleRateLimit = (message) => (req, res, next) => {
    next(new AppError(message, 429));
};

// General API rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: handleRateLimit("Too many requests. Please try again later.")
});

// Authentication rate limiter
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: handleRateLimit("Too many authentication attempts. Please try again later.")
});

// Helmet security middleware
export const securityHeaders = helmet();