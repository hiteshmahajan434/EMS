import Notification from "../models/Notification.js";

let socketServer;

export const setNotificationSocketServer = (io) => {
    socketServer = io;
};

export const userNotificationRoom = (userId) => `user:${userId}`;

export const createNotification = async ({
    recipientUserId,
    organizationId,
    type,
    message,
    relatedEntityId
}) => {
    const notification = await Notification.create({
        recipientUserId,
        organizationId,
        type,
        message,
        relatedEntityId
    });

    socketServer
        ?.to(userNotificationRoom(recipientUserId))
        .emit("notification:new", notification.toObject());

    return notification;
};

export const createNotifications = async (notification, recipientUserIds) => {
    const uniqueRecipients = [...new Set(recipientUserIds.map((id) => id.toString()))];
    return Promise.all(
        uniqueRecipients.map((recipientUserId) =>
            createNotification({ ...notification, recipientUserId })
        )
    );
};
