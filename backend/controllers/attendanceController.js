import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import { inngest } from "../inngest/index.js";
import AppError from "../middlewares/AppError.js";

//Clock in out for employee/manager
//POST /api/attendance/clock
export const clockInOut = async (req, res) => {
        const userId = req.user.id;
        const organizationId = req.user.organization;

        const user = await User.findById(userId);

        if (!user) {
            throw new AppError("Employee not found", 403);
        }

        if (user.isDeleted) {
            throw new AppError("Your account is deactivated. You cannot clock in/out", 403);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({
            userId,
            date: today
        });

        const now = new Date();

        // ---------------- Clock In ----------------
        if (!existingAttendance) {
            const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
            const newAttendance = await Attendance.create({
                userId,
                organizationId,
                date: today,
                checkIn: now,
                status: isLate ? "LATE" : "PRESENT"
            });

            await inngest.send({
                name: "employee/check-out",
                data: {
                    employeeId: user._id.toString(),
                    attendanceId: newAttendance._id.toString()
                }
            });

            return res.json({ success: true, type: "CHECK_IN", data: newAttendance });
        }

        // ---------------- Already Checked Out ----------------
        if (existingAttendance.checkOut) {
            throw new AppError("You have already checked out today", 400);
        }

        // ---------------- Clock Out ----------------
        existingAttendance.checkOut = now;

        const Hours = (existingAttendance.checkOut - existingAttendance.checkIn) / // This return difference in miliseconds
            (1000 * 60 * 60); // 1 sec = 1000 milisec, 1 min = 60 sec, 1 hr = 60 min  Therefore, 1 hr = 1000 * 60 * 60 milisec

        const workingHours = Number(Hours.toFixed(2)); // 8.333333 Hrs -> "8.33" String -> Number -> 8.33 Hrs

        let dayType;
        if (workingHours >= 8) {
            dayType = "Full Day";
        }
        else if (workingHours >= 6) {
            dayType = "Three Quarter Day";
        }
        else if (workingHours >= 4) {
            dayType = "Half Day";
        }
        else {
            dayType = "Short Day";
        }

        existingAttendance.workingHours = workingHours;
        existingAttendance.dayType = dayType;

        await existingAttendance.save();

        return res.json({ success: true, type: "CHECK_OUT", data: existingAttendance });
}

//GET Self Attendance Employee/Admin
//GET /api/attendance/my
export const getMyAttendance = async (req, res) => {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const now = new Date();

        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 59, 999);

        const attendanceHistory = await Attendance.find({ //Monthly records 
            userId,
            date: {
                $gte: firstDay,
                $lte: lastDay
            }
        }).sort({ date: -1 });

        const daysPresent = attendanceHistory.filter(
            a => a.status === "PRESENT" || a.status === "LATE"
        ).length;

        const lateArrivals = attendanceHistory.filter(
            a => a.status === "LATE"
        ).length;

        const totalHours = attendanceHistory.reduce(
            (sum, a) => sum + (a.workingHours || 0),
            0
        );

        const averageWorkingHours =
            attendanceHistory.length > 0
                ? Number((totalHours / attendanceHistory.length).toFixed(1))
                : 0;

        // Today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAttendance = attendanceHistory.find(
            attendance =>
                attendance.date.getTime() === today.getTime()
        );

        return res.status(200).json({
            success: true,
            summary: {
                daysPresent,
                lateArrivals,
                averageWorkingHours,
            },
            todayRecord: {
                checkIn: todayAttendance?.checkIn || null,
                checkOut: todayAttendance?.checkOut || null
            },
            attendance: attendanceHistory,
            user: {
                isDeleted: user.isDeleted
            }
        });

}

//GET All employee attendance to manager
//GET /api/attendance/team
export const getTeamAttendance = async (req, res) => {
        const { firstName, status, date, department, filterRole } = req.query;

        const organizationId = req.user.organization;
        const userRole = req.user.role;

        const filter = {
            organization: organizationId
        };

        if (firstName) filter.firstName = firstName;
        if (department) filter.department = department;

        if (userRole == "admin") {
            filter.role = filterRole ? filterRole : { $in: ["employee", "manager"] };
        }
        else {
            filter.role = "employee";
            filter.manager = req.user.id;
        }

        const users = await User.find(filter).select("_id");

        const userIds = users.map(user => user._id);

        const attendanceFilter = {
            userId: { $in: userIds },
        }

        if (date) {
            const selectedDate = new Date(date);

            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            attendanceFilter.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        if (status) attendanceFilter.status = status

        const attendance = await Attendance.find(attendanceFilter)
            .populate("userId", "firstName lastName role department")
            .sort({ date: -1 });

        return res.status(200).json(attendance);
}

//Manager/Admin Single Employee Attendance
//GET /api/attendance/team/:id
export const getUserAttendance = async (req, res) => {
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) throw new AppError("User not found", 404);

        if (
            req.user.role === "manager" &&
            (!user.manager ||
                user.manager.toString() !== req.user.id.toString())
        ) {
            throw new AppError("Unauthorized", 403);
        }

        if (
            user.organization.toString() !==
            req.user.organization.toString()
        ) {
            throw new AppError("Unauthorized", 403);
        }

        const attendance = await Attendance.find({ userId }).sort({ date: -1 });

        return res.status(200).json(attendance);
}