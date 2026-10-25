import Notification from "../models/Notification.js";
import AppError from "../middlewares/AppError.js";

const notificationScope = (user) => ({
    recipientUserId: user.id,
    organizationId: user.organization
});

export const getNotifications = async (req, res) => {
    const scope = notificationScope(req.user);
    const [notifications, unreadCount] = await Promise.all([
        Notification.find(scope).sort({ createdAt: -1 }).limit(50).lean(),
        Notification.countDocuments({ ...scope, isRead: false })
    ]);

    return res.json({ data: notifications, unreadCount });
};

export const getUnreadNotificationCount = async (req, res) => {
    const unreadCount = await Notification.countDocuments({
        ...notificationScope(req.user),
        isRead: false
    });
    return res.json({ unreadCount });
};

export const markNotificationAsRead = async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        {
            _id: req.params.id,
            ...notificationScope(req.user)
        },
        { $set: { isRead: true } },
        { new: true }
    ).lean();

    if (!notification) {
        throw new AppError("Notification not found", 404);
    }

    return res.json({ data: notification });
};
