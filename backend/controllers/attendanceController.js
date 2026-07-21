import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

//Clock in out for employee/manager
//POST /api/attendance
export const clockInOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const organizationId = req.user.organization;

        const user = await User.findById(userId);

        if(!user){
            return res.status(403).json({error: "Employee not found"});
        }

        if(user.isDeleted){
            return res.status(403).json({error: "Your account is deactivated. You cannot clock in/out"});
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({
            userId,
            date: today
        });

        const now = new Date();

        // ---------------- Clock In ----------------
        if(!existingAttendance){
            const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
            const newAttendance = await Attendance.create({
                userId,
                organizationId,
                date: today,
                checkIn: now,
                status: isLate? "LATE": "PRESENT"
            });

            return res.json({success: true, type: "CHECK_IN", data: newAttendance});
        }

        // ---------------- Already Checked Out ----------------
        if(existingAttendance.checkOut){
            return res.status(400).json({success: false, error: "You have already checked out today"});
        }

        // ---------------- Clock Out ----------------
        existingAttendance.checkOut = now;

        const Hours = (existingAttendance.checkOut - existingAttendance.checkIn) / // This return difference in miliseconds
            (1000 * 60* 60); // 1 sec = 1000 milisec, 1 min = 60 sec, 1 hr = 60 min  Therefore, 1 hr = 1000 * 60 * 60 milisec

        const workingHours = Number(Hours.toFixed(2)); // 8.333333 Hrs -> "8.33" String -> Number -> 8.33 Hrs

        let dayType;
        if(workingHours >= 8){
            dayType = "Full Day";
        }
        else if(workingHours >= 6){
            dayType = "Three Quarter Day";
        }
        else if(workingHours >= 4){
            dayType = "Half Day";
        }
        else{
            dayType = "Short Day";
        }

        existingAttendance.workingHours = workingHours;
        existingAttendance.dayType = dayType;

        await existingAttendance.save();

        return res.json({success: true, type: "CHECK_OUT", data: existingAttendance});
    } catch (error) {
        console.error("Clock in out error", error);
        return res.status(500).json({success: false, error: "Clock in out operation failed"});
    }
}

//GET Self Attendance Employee/Admin
//GET /api/attendance/my
export const getMyAttendance = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const attendanceHistory = await Attendance.find({userId: userId})
            .sort({date: -1})
            .limit(30) //Only 30 records 

        return res.json({
            data: attendanceHistory,
            user: {isDeleted : user.isDeleted}
        });       
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch attendance" });
    }
}

//GET All employee attendance to manager
//GET /api/attendance/team
export const getTeamAttendance = async (req, res) => {
    try {
        const {firstName, status, date, department, filterRole} = req.query;

        const organizationId = req.user.organization;
        const userRole = req.user.role;

        const filter = {
            organization : organizationId
        };

        if(firstName) filter.firstName = firstName;
        if(department) filter.department = department;

        if(userRole == "admin"){
            filter.role = filterRole ? filterRole : {$in : ["employee", "manager"]};
        }
        else{
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
            selectedDate.setHours(0,0,0,0);
            attendanceFilter.date = selectedDate;
        }
        if(status) attendanceFilter.status = status

        const attendance = await Attendance.find(attendanceFilter)
        .populate("userId", "firstName lastName employeeId")
        .sort({date: -1});

        return res.status(200).json(attendance);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

//Manager/Admin Single Employee Attendance
//GET /api/attendance/team/:id
export const getUserAttendance = async (req, res) => {
    try {
        const userId = req.params.id;       
        
        const user = await User.findById(userId);

        if(!user) return res.status(404).json({error: "User not found"});

        if (
            req.user.role === "manager" &&
            (!user.manager ||
            user.manager.toString() !== req.user.id.toString())
        ) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }

        if (
            user.organization.toString() !==
            req.user.organization.toString()
        ) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }

        const attendance = await Attendance.find({userId}).sort({date: -1});

        return res.status(200).json(attendance);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}