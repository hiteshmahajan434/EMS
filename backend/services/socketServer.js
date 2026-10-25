import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { setNotificationSocketServer, userNotificationRoom } from "./notificationService.js";

export const initializeSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || true
        }
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Unauthorized"));
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch {
            return next(new Error("Unauthorized"));
        }

        if (!decoded.id || !mongoose.isValidObjectId(decoded.id)) {
            return next(new Error("Unauthorized"));
        }

        let user;
        try {
            user = await User.findById(decoded.id).select("+tokenVersion");
        } catch (error) {
            return next(error);
        }

        if (
            !user ||
            user.isDeleted ||
            (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0) ||
            !["admin", "manager", "employee"].includes(user.role) ||
            !user.organization
        ) {
            return next(new Error("Unauthorized"));
        }

        socket.data.userId = user._id.toString();
        socket.data.organizationId = user.organization.toString();
        socket.data.role = user.role;
        return next();
    });

    io.on("connection", (socket) => {
        socket.join(userNotificationRoom(socket.data.userId));
    });

    setNotificationSocketServer(io);
    return io;
};
