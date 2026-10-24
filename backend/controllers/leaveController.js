import User from "../models/User.js";
import Leave from "../models/Leave.js";
import { inngest } from "../inngest/index.js";
import AppError from "../middlewares/AppError.js";

//Employee/Manager apply leave to Manager/Admin
//POST /api/leave
export const createLeave = async (req, res) => {
        const {type, startDate, endDate, reason} = req.body;
        const userId = req.user.id;
        const organizationId = req.user.organization;

        const user = await User.findById(userId);
        if(!user){
            throw new AppError("User not found", 404);
        }

        if(user.isDeleted){
            throw new AppError("Your account is deactivated. You cannot apply for leave", 403);
        } 

        if(!type || !startDate || !endDate || !reason){
            throw new AppError("All fields are required", 400);
        } 

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const start = new Date(startDate);
        const end = new Date(endDate);

        if(start <= today || end <= today){
            throw new AppError("Leave dates must be in the future", 400);
        }

        if(start > end){
            throw new AppError("End date cannot be before start date", 400);
        }

        const overlap = await Leave.findOne({
            userId: user._id,
            status: { $ne: "REJECTED" },
            startDate: { $lte: end },
            endDate: { $gte: start }
        });

        if (overlap) {
            throw new AppError("Leave already exists for selected dates", 400);
        }

        const newLeave = await Leave.create({
            userId,
            organizationId,
            type,
            startDate: start,
            endDate: end,
            reason,
            status: "PENDING"
        });

        await inngest.send({
            name: "leave/pending",
            data: {
                leaveApplicationId: newLeave._id.toString(),
            }
        });

        return res.json({success: true, data: newLeave});        
}

//Get self leaves
//GET /api/leave/my
export const getMyLeave = async (req, res) => {
        const userId = req.user.id;

        const user = await User.findById(userId).lean();

        if(!user){
            throw new AppError("User not found", 404);
        }

        const leaves = await Leave.find({userId: userId}).sort({createdAt: -1});

        return res.json({
            data: leaves,
            user: {
                ...user,
                id: userId
            }
        });
}

// Manager / Admin View Pending Leaves
// GET /api/leave
export const getLeave = async (req, res) => {
        const { date, status } = req.query;

        let filter = {};

        if(req.user.role === "manager"){
            const employees = await User.find({
                manager: req.user.id,
                role: "employee"
            }).select("_id");

            filter.userId = {$in : employees.map(emp => emp._id)};
        }

        else if(req.user.role == "admin"){
            const managers = await User.find({
                organization: req.user.organization,
                role: "manager"
            }).select("_id");

            filter.userId = {$in: managers.map(manager => manager._id)};
        }

        if(status) filter.status = status;
        if (date) {
            const selectedDate = new Date(date);

            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            filter.startDate = {
                $lte: endOfDay
            };

            filter.endDate = {
                $gte: startOfDay
            };
        }

        const leaves = await Leave.find(filter)
            .populate("userId")
            .sort({createdAt: -1});

        const data = leaves.map((leave) => {
            const obj = leave.toObject();
            return {
                ...obj,
                id: obj._id.toString(),
                user: obj.userId,
                userId: obj.userId?._id?.toString()
            }
        });

        return res.json({data});
}

//Update leave status
//PATCH /api/leave/:id
export const updateLeave = async (req, res) => {
        const { status } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            throw new AppError("Invalid status", 400);
        }

        const leave=await Leave.findById(req.params.id)
            .populate("userId");

        if(!leave){
            throw new AppError("Leave not found", 404);
        }

        // -------------------------------
        // Manager approves Employee leave
        // -------------------------------

        if (req.user.role === "manager") {
            if (leave.userId.role !== "employee") { //After populating userId we can use like this leave.userId.role
                throw new AppError("Managers can approve only employee leaves", 403);
            }

            if (String(leave.userId.manager) !== String(req.user.id)) {
                throw new AppError("Employee does not report to you", 403);
            }
        }

        // -------------------------------
        // Admin approves Manager leave
        // -------------------------------

        else if (req.user.role === "admin") {
            if (leave.userId.role !== "manager") {
                throw new AppError("Admins can approve only manager leaves", 403);
            }

            if (String(leave.userId.organization) !==String(req.user.organization)) {
                throw new AppError("Unauthorized", 403);
            }
        }
        else {
            throw new AppError("Access denied", 403);
        }

        leave.status = status;

        await leave.save();
        
        return res.json({success: true, data: leave});
}