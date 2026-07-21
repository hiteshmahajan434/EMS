import User from "../models/User.js";
import Leave from "../models/Leave.js";

//Employee/Manager apply leave to Manager/Admin
//POST /api/leave
export const createLeave = async (req, res) => {
    try {
        const {type, startDate, endDate, reason} = req.body;
        const userId = req.user.id;
        const organizationId = req.user.organization;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if(user.isDeleted){
            return res.status(403).json({error: "Your account is deactivated. You cannot apply for leave"});
        } 

        if(!type || !startDate || !endDate || !reason){
            return res.status(400).json({error: "All fields are required"})
        } 

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const start = new Date(startDate);
        const end = new Date(endDate);

        if(start <= today || end <= today){
            return res.status(400).json({error: "Leave dates must be in the future"});
        }

        if(start > end){
            return res.status(400).json({error: "End date cannot be before start date"});
        }

        const overlap = await Leave.findOne({
            userId: user._id,
            status: { $ne: "REJECTED" },
            startDate: { $lte: end },
            endDate: { $gte: start }
        });

        if (overlap) {
            return res.status(400).json({
                error: "Leave already exists for selected dates"
            });
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

        return res.json({success: true, data: newLeave});        
    } catch (error) {
        return res.status(500).json({error: "Leave creation failed"});
    }
}

//Get self leaves
//GET /api/leave/my
export const getMyLeave = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).lean();

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const leaves = await Leave.find({userId: userId}).sort({createdAt: -1});

        return res.json({
            data: leaves,
            user: {
                ...user,
                id: userId
            }
        });
    } catch (error) {
        return res.status(500).json({error: "Leave fetching failed"});
    }
}

// Manager / Admin View Pending Leaves
// GET /api/leave
export const getLeave = async (req, res) => {
    try {
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
    } catch (error) {
        return res.status(500).json({error: "Failed to fetch leaves"});
    }
}

//Update leave status
//PATCH /api/leave/:id
export const updateLeave = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
        }

        const leave=await Leave.findById(req.params.id)
            .populate("userId");

        if(!leave){
            return res.status(404).json({
                error:"Leave not found"
            });
        }

        // -------------------------------
        // Manager approves Employee leave
        // -------------------------------

        if (req.user.role === "manager") {
            if (leave.userId.role !== "employee") { //After populating userId we can use like this leave.userId.role
                return res.status(403).json({
                    error: "Managers can approve only employee leaves"
                });
            }

            if (String(leave.userId.manager) !== String(req.user.id)) {
                return res.status(403).json({
                    error: "Employee does not report to you"
                });
            }
        }

        // -------------------------------
        // Admin approves Manager leave
        // -------------------------------

        else if (req.user.role === "admin") {
            if (leave.userId.role !== "manager") {
                return res.status(403).json({
                    error: "Admins can approve only manager leaves"
                });
            }

            if (String(leave.userId.organization) !==String(req.user.organization)) {
                return res.status(403).json({
                    error: "Unauthorized"
                });
            }
        }
        else {
            return res.status(403).json({
                error: "Access denied"
            });
        }

        leave.status = status;

        await leave.save();
        
        return res.json({success: true, data: leave});
    } catch (error) {
        return res.status(500).json({ error: "Failed to update leave" });
    }
}