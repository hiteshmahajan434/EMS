import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import AppError from "./AppError.js";

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        throw new AppError("Unauthorized", 401);
    }

    let decoded;
    try {
        const token = authHeader.split(' ')[1];
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            throw new AppError("Unauthorized", 401);
        }
        throw error;
    }

    const user = await User.findById(decoded.id).select("+tokenVersion +password");

    if (!user) {
        throw new AppError("User not found", 401);
    }

    if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
        throw new AppError("Unauthorized", 401);
    }

    if (user.isDeleted) {
        throw new AppError("Your account has been deactivated.", 403);
    }

    if (user.role !== "superadmin" && user.organization) {
        const organization = await Organization.findById(user.organization);
        if (!organization || !organization.isActive) {
            throw new AppError("Your organization has been deactivated. Please contact the Super Admin.", 403);
        }
    }

    req.user = decoded;
    next();
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("Forbidden", 403));
        }

        next();
    };
};
