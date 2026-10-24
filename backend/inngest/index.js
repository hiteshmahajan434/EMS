import { Inngest } from "inngest";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import User from "../models/User.js";
import sendEmail from "../config/nodemailer.js";

export const inngest = new Inngest({ id: "Onecore" });

const HOUR_IN_MS = 60 * 60 * 1000;

const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

const autoCheckOut = inngest.createFunction(
    { id: "autoCheckOut", triggers: [{ event: "employee/check-out" }] },
    async ({ event, step }) => {
        const { employeeId, attendanceId } = event.data;
        if (!employeeId || !attendanceId) {
            throw new Error("Attendance check-out event is missing required IDs");
        }

        await step.sleepUntil(
            "wait-nine-hours-after-check-in",
            new Date(Date.now() + 9 * HOUR_IN_MS)
        );

        const attendanceData = await step.run("load-open-attendance", async () => {
            const attendance = await Attendance.findById(attendanceId).lean();
            if (!attendance || attendance.checkOut || !attendance.checkIn) return null;

            const employee = await User.findById(employeeId)
                .select("firstName email department")
                .lean();
            if (!employee) return null;

            return {
                firstName: employee.firstName,
                email: employee.email,
                department: employee.department,
                checkIn: attendance.checkIn
            };
        });

        if (!attendanceData) return { skipped: true };

        await step.run("send-check-out-reminder", () =>
            sendEmail({
                to: attendanceData.email,
                subject: "Attendance Check-Out Reminder",
                body: `
                    <div style="max-width: 600px; font-family: Arial, sans-serif;">
                        <h2>Hi ${escapeHtml(attendanceData.firstName)},</h2>
                        <p>You have been checked in${attendanceData.department ? ` to ${escapeHtml(attendanceData.department)}` : ""} for nine hours.</p>
                        <p>Please remember to check out within the next hour.</p>
                        <p>Best regards,<br />OneCore</p>
                    </div>
                `
            })
        );

        await step.sleepUntil(
            "wait-one-hour-after-reminder",
            new Date(Date.now() + HOUR_IN_MS)
        );

        const updatedAttendance = await step.run("auto-check-out-if-still-open", async () => {
            const attendance = await Attendance.findOne({
                _id: attendanceId,
                checkOut: null
            });
            if (!attendance) return false;

            attendance.checkOut = new Date(
                new Date(attendance.checkIn).getTime() + 4 * HOUR_IN_MS
            );
            attendance.workingHours = 4;
            attendance.dayType = "Half Day";
            attendance.status = "LATE";
            await attendance.save();
            return true;
        });

        return { autoCheckedOut: updatedAttendance };
    }
);

const leaveApplicationReminder = inngest.createFunction(
    { id: "leave-application-reminder", triggers: [{ event: "leave/pending" }] },
    async ({ event, step }) => {
        const { leaveApplicationId } = event.data;
        if (!leaveApplicationId) {
            throw new Error("Leave reminder event is missing the leave ID");
        }

        await step.sleepUntil(
            "wait-24-hours-for-leave-review",
            new Date(Date.now() + 24 * HOUR_IN_MS)
        );

        const reminder = await step.run("load-pending-leave-and-approver", async () => {
            const leave = await Leave.findById(leaveApplicationId).lean();
            if (!leave || leave.status !== "PENDING") return null;

            const applicant = await User.findById(leave.userId)
                .select("firstName lastName email department role manager")
                .lean();
            if (!applicant) return null;

            let approver;
            if (applicant.role === "employee" && applicant.manager) {
                approver = await User.findOne({
                    _id: applicant.manager,
                    organization: leave.organizationId,
                    isDeleted: false,
                    status: "ACTIVE"
                }).select("email firstName").lean();
            }

            if (!approver) {
                approver = await User.findOne({
                    organization: leave.organizationId,
                    role: "admin",
                    isDeleted: false,
                    status: "ACTIVE"
                }).select("email firstName").lean();
            }

            if (!approver?.email) {
                throw new Error(`No active approver found for leave ${leaveApplicationId}`);
            }

            return {
                approverName: approver.firstName || "Approver",
                approverEmail: approver.email,
                applicantName: `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Team member",
                department: applicant.department,
                leaveType: leave.type,
                startDate: leave.startDate,
                endDate: leave.endDate
            };
        });

        if (!reminder) return { skipped: true };

        await step.run("send-leave-review-reminder", () =>
            sendEmail({
                to: reminder.approverEmail,
                subject: "Pending Leave Request Reminder",
                body: `
                    <div style="max-width: 600px; font-family: Arial, sans-serif;">
                        <h2>Hi ${escapeHtml(reminder.approverName)},</h2>
                        <p>A leave request is still awaiting review after 24 hours.</p>
                        <p><strong>Team member:</strong> ${escapeHtml(reminder.applicantName)}</p>
                        <p><strong>Department:</strong> ${escapeHtml(reminder.department || "Not specified")}</p>
                        <p><strong>Leave type:</strong> ${escapeHtml(reminder.leaveType)}</p>
                        <p><strong>Dates:</strong> ${new Date(reminder.startDate).toLocaleDateString()} - ${new Date(reminder.endDate).toLocaleDateString()}</p>
                        <p>Please review the request in OneCore.</p>
                    </div>
                `
            })
        );

        return { reminderSent: true };
    }
);

const attendanceReminderCron = inngest.createFunction(
    { id: "attendance-reminder-cron", triggers: { cron: "0 6 * * *" } },
    async ({ step }) => {
        const today = await step.run("get-india-date-range", () => {
            const dateString = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(new Date());
            const start = new Date(`${dateString}T00:00:00+05:30`);
            const end = new Date(start.getTime() + 24 * HOUR_IN_MS);

            return {
                start: start.toISOString(),
                end: end.toISOString()
            };
        });

        const employees = await step.run("get-active-employees", async () => {
            const users = await User.find({
                role: "employee",
                status: "ACTIVE",
                isDeleted: false
            }).select("_id firstName email department").lean();

            return users.map((user) => ({
                id: user._id.toString(),
                firstName: user.firstName,
                email: user.email,
                department: user.department
            }));
        });

        const employeeIds = employees.map((employee) => employee.id);
        if (employeeIds.length === 0) {
            return { totalActive: 0, onLeave: 0, checkedIn: 0, remindersSent: 0 };
        }

        const [onLeaveIds, checkedInIds] = await Promise.all([
            step.run("get-employees-on-approved-leave", async () => {
                const leaves = await Leave.find({
                    userId: { $in: employeeIds },
                    status: "APPROVED",
                    startDate: { $lt: new Date(today.end) },
                    endDate: { $gte: new Date(today.start) }
                }).distinct("userId");
                return leaves.map((id) => id.toString());
            }),
            step.run("get-employees-who-checked-in", async () => {
                const attendances = await Attendance.find({
                    userId: { $in: employeeIds },
                    date: {
                        $gte: new Date(today.start),
                        $lt: new Date(today.end)
                    }
                }).distinct("userId");
                return attendances.map((id) => id.toString());
            })
        ]);

        const absentEmployees = employees.filter((employee) =>
            !onLeaveIds.includes(employee.id) &&
            !checkedInIds.includes(employee.id)
        );

        await Promise.all(absentEmployees.map((employee) =>
            step.run(`send-attendance-reminder-${employee.id}`, () =>
                sendEmail({
                    to: employee.email,
                    subject: "Attendance Reminder",
                    body: `
                        <div style="max-width: 600px; font-family: Arial, sans-serif;">
                            <h2>Hi ${escapeHtml(employee.firstName)},</h2>
                            <p>Our records show that you have not checked in today.</p>
                            <p>Please mark your attendance or contact your administrator if you need help.</p>
                            <p>Best regards,<br />OneCore</p>
                        </div>
                    `
                })
            )
        ));

        return {
            totalActive: employees.length,
            onLeave: onLeaveIds.length,
            checkedIn: checkedInIds.length,
            remindersSent: absentEmployees.length
        };
    }
);

export const functions = [
    autoCheckOut,
    leaveApplicationReminder,
    attendanceReminderCron
];
