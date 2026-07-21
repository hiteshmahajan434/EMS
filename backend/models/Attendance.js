import mongoose from "mongoose";

const attendanceSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        checkIn: {
            type: Date,
            default: null
        },
        checkOut: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ["PRESENT", "ABSENT", "LATE"],
            default: "PRESENT",
        },
        workingHours: {
            type: Number,
            default: 0
        },
        dayType: {
            type: String,
            enum: ["Full Day", "Three Quarter Day", "Half Day", "Short Day"],
        },
    },
    {
        timestamps: true
    }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true }); // This line means unique collection of userId and date, 
// means user cannot have two attendance records on same date, used to avoid twice clockin clockout


const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;