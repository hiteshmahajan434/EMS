import { Router } from "express";
import { authorize, protect } from "../middlewares/authMiddleware.js";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead
} from "../controllers/notificationController.js";

const notificationRouter = Router();
notificationRouter.use(protect, authorize("admin", "manager", "employee"));

notificationRouter.get("/", getNotifications);
notificationRouter.get("/unread-count", getUnreadNotificationCount);
notificationRouter.patch("/:id/read", markNotificationAsRead);

export default notificationRouter;
