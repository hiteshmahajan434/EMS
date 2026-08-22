import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payslip from "../models/Payslip.js";

export const getEmployeeDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        const [employee, todayAttendance, presentDays, pendingLeaves, latestPayslip] = await Promise.all([
            User.findById(userId)
                .select("firstName department"),

            Attendance.findOne({
                userId,
                date: today
            }),

            Attendance.countDocuments({
                userId,
                date: {
                    $gte: firstDayOfMonth,
                    $lte: today
                }
            }),

            Leave.countDocuments({
                userId,
                status: "PENDING"
            }),

            Payslip.findOne({
                userId,
            }).sort({
                year: -1,
                month: -1
            })
        ]);

        if (!employee) {
            return res.status(404).json({
                error: "Employee not found"
            });
        }

        return res.status(200).json({
            todayAttendance: todayAttendance
                ? {
                    checkIn: todayAttendance.checkIn,
                    checkOut: todayAttendance.checkOut,
                    totalHours: todayAttendance.totalHours,
                    status: todayAttendance.checkOut
                            ? "Completed"
                            : "Clocked In"
                }
                : {
                    checkIn: null,
                    checkOut: null,
                    totalHours: null,
                    status: "Not Clocked In"
                },
            presentDays,
            pendingLeaves,
            latestPayslip: latestPayslip
                ? {
                    month: latestPayslip.month,
                    year: latestPayslip.year,
                    netSalary: latestPayslip.netSalary
                }
                : null,
            employee: {
                firstName: employee.firstName,
                department: employee.department
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to fetch dashboard"});
    }
}

export const getManagerDashboard = async (req, res) => {
    try {
        const managerId = req.user.id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lateTime = new Date();
        lateTime.setHours(9, 0, 0, 0);

        const employees = await User.find({
            manager: managerId,
            role: "employee",
            isDeleted: false
        }).select("_id");

        const employeeIds = employees.map(emp => emp._id);  

        const teamMembers = employeeIds.length;
        
        const [presentToday, onLeave, lateToday, pendingLeaves, pendingLeaveList] = await Promise.all([

            Attendance.countDocuments({
                userId: { $in: employeeIds },
                date: today
            }),

            Leave.countDocuments({
                userId: { $in: employeeIds },
                status: "APPROVED",
                startDate: { $lte: today },
                endDate: { $gte: today }
            }),

            Attendance.countDocuments({
                userId: { $in: employeeIds },
                date: today,
                clockIn: {$gt: lateTime},
            }),

            Leave.countDocuments({
                userId: { $in: employeeIds },
                status: "PENDING"
            }),

            Leave.find({
                userId: { $in: employeeIds },
                status: "PENDING"
            })
            .populate("userId", "firstName lastName")
            .sort({ createdAt: -1 })
            .limit(5)

        ]);

        res.status(200).json({
            stats: {
                teamMembers,
                presentToday,
                onLeave,
                lateToday,
                pendingLeaves
            },
            pendingLeaveRequests: pendingLeaveList
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to fetch dashboard"});        
    }
}

export const getAdminDashboard = async (req, res) => {
    try {
        const organizationId = req.user.organization;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const managers = await User.find({
            organization: organizationId,
            role: "manager"
        }).select("_id");

        const managerIds = managers.map(m => m._id);


        const [
            totalEmployees,
            presentToday,
            onLeave,
            pendingManagerLeaves,
            payslips
        ] = await Promise.all([

            User.countDocuments({
                organization: organizationId,
                role: {
                    $in: ["manager", "employee"]
                },
                isDeleted: false
            }),

            Attendance.countDocuments({
                organizationId,
                date: today
            }),

            Leave.countDocuments({
                organizationId,
                status: "APPROVED",
                startDate: { $lte: today },
                endDate: { $gte: today }
            }),

            Leave.countDocuments({
                userId: {$in: managerIds},
                organizationId,
                status: "PENDING",
            }),

            Payslip.find({
                organizationId,
                month: currentMonth,
                year: currentYear
            })
        ]);

        let totalPayroll = 0;

        for (const payslip of payslips) {
            totalPayroll += payslip.netSalary;
        }

        res.status(200).json({
            totalEmployees,
            presentToday,
            onLeave,
            pendingManagerLeaves,
            totalPayroll
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getDashboard = async (req, res) => {
    try {
        const role = req.user.role;

        if (role === "employee") {
            const data = await getEmployeeDashboardData(req);
            return res.status(200).json(data);
        }
        if (role === "manager") {
            const employeeData = await getEmployeeDashboardData(req);
            const managerData = await getManagerDashboardData(req);

            return res.status(200).json({
                employeeData,
                managerData
            });
        }
        if (role === "admin") {
            const data = await getAdminDashboardData(req);

            return res.status(200).json(data);
        }

        return res.status(403).json({
            error: "Invalid user role"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch dashboard"
        });
    }
};