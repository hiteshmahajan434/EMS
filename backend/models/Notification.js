import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipientUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },
        type: {
            type: String,
            enum: ["LEAVE_APPLICATION", "LEAVE_STATUS", "PAYSLIP_AVAILABLE"],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        relatedEntityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

notificationSchema.index({ recipientUserId: 1, organizationId: 1, createdAt: -1 });
notificationSchema.index({ recipientUserId: 1, organizationId: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;