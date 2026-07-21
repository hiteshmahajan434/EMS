import User from "../models/User.js";
import Payslip from "../models/Payslip.js";

//Create Payslip
//POST /api/payslip
export const createPayslip = async (req, res) => {
    try {
        const {userId, month, year, basicSalary, allowances, deductions} = req.body;
        const organizationId = req.user.organization;

        if(!userId || !month || !year || !basicSalary){
            return res.status(400).json({error: "Missing fields"});
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Admin -> Manager
        if (req.user.role === "admin" && user.role !== "manager") {
            return res.status(403).json({
                error: "Admin can generate payslips only for managers"
            });
        }

        // Manager -> Employee
        if (req.user.role === "manager" && (user.role !== "employee" || user.manager?.toString() !== req.user.id)) {
            return res.status(403).json({
                error: "Manager can generate payslips only for their employees"
            });
        }

        const existing = await Payslip.findOne({
            userId,
            month,
            year
        });

        if (existing) {
            return res.status(400).json({
                error: "Payslip already generated"
            });
        }

        const netSalary = Number(basicSalary) + Number(allowances || 0) - Number(deductions || 0);

        const payslip = await Payslip.create({
            userId,
            organizationId,
            month: Number(month),
            year: Number(year),
            basicSalary: Number(basicSalary),
            allowances: Number(allowances || 0),
            deductions: Number(deductions || 0),
            netSalary
        });

        return res.status(201).json({success: true, data: payslip});        
    } catch (error) {
        return res.status(500).json({error: "Payslip creation failed"});
    }
}

//Get Payslips for admin and manager
//GET /api/payslip
export const getPayslips = async (req, res) => {
    try {
        let filter = {};

        if(req.user.role == "admin"){
            const managers = await User.find({
                organization: req.user.organization,
                role: "manager"
            }).select("_id");

            filter.userId = {$in : managers};
        }

        if(req.user.role == "manager"){
            const employees = await User.find({
                manager: req.user.id,
                role: "employee"
            }).select("_id");

            filter.userId = {$in : employees};
        }

        const payslips = await Payslip.find(filter)
            .populate("userId")
            .sort({createdAt: -1});

        const data = payslips.map((p) => {
            const obj = p.toObject();

            return {
            ...obj,
            id: obj._id.toString(),
            user: obj.userId,
            userId: obj.userId?._id?.toString(),
            };
        });

        return res.json(data);
    } catch (error) {
        return res.status(500).json({error: "Failed to fetch payslips"});
    }
}

//Get self payslips for employee and manager
//GET /api/payslip/my
export const getMyPayslips = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const payslips = await Payslip.find({userId: req.user.id}).sort({createdAt : -1});

        return res.json({data: payslips});
    } catch (error) {
        return res.status(500).json({error: "Failed to fetch payslips"});
    }
}

//Get payslip by ID
//GET /api/payslip/:id
export const getPayslipByID = async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id)
            .populate("userId")
            .lean();

        if(!payslip){
            return res.status(404).json({error: "Payslip not found"});
        }
        // Employee -> Own Payslip
        if (req.user.role === "employee" && payslip.userId._id.toString() !== req.user.id) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }

        // Manager -> Own Employees
        if (req.user.role === "manager") {
            const employee = await User.findById(payslip.userId._id);

            if (employee.role !== "employee" || employee.manager?.toString() !== req.user.id) {
                return res.status(403).json({
                error: "Forbidden",
                });
            }
        }

        // Admin -> Managers in Same Organization
        if (req.user.role === "admin") {
            const manager = await User.findById(payslip.userId._id);

            if (manager.role !== "manager" || manager.organization.toString() !== req.user.organization) {
                return res.status(403).json({
                error: "Forbidden",
                });
            }
        }

        const data = {
            ...payslip,
            id: payslip._id.toString(),
            user: payslip.userId
        };

        return res.json(data);
    } catch (error) {
        return res.status(500).json({error: "Failed to fetch payslip"});
    }
}