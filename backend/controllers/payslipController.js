import User from "../models/User.js";
import Payslip from "../models/Payslip.js";
import AppError from "../middlewares/AppError.js";
import { createNotification } from "../services/notificationService.js";

//Create Payslip
//POST /api/payslip
export const createPayslip = async (req, res) => {
        const {userId, month, year, allowances, deductions} = req.body;
        const organizationId = req.user.organization;

        if(!userId || !month || !year){
            throw new AppError("Missing fields", 400);
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        // Admin can generate only for users in the same organization
        if (!user.organization || user.organization.toString() !== req.user.organization.toString()) {
            throw new AppError("User does not belong to your organization", 403);
        }

        if (
            req.user.role === "manager" &&
            (user.role !== "employee" || user.manager?.toString() !== req.user.id)
        ) {
            throw new AppError("Managers can generate payslips only for their direct reports", 403);
        }

        const basicSalary = user.basicSalary;
        
        const existing = await Payslip.findOne({
            userId,
            month,
            year
        });

        if (existing) {
            throw new AppError("Payslip already generated", 400);
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

        const monthName = new Date(2000, Number(month) - 1).toLocaleString("en-US", { month: "long" });
        await createNotification({
            recipientUserId: user._id,
            organizationId,
            type: "PAYSLIP_AVAILABLE",
            message: `Your ${monthName} ${year} payslip is available.`,
            relatedEntityId: payslip._id
        });

        return res.status(201).json({success: true, data: payslip});        
}

//GET /api/payslip
export const getPayslips = async (req, res) => {
        // ADMIN
        if (req.user.role === "admin") {

            const { month, year, role } = req.query;

            const users = await User.find({
                organization: req.user.organization,
                role: { $in: ["manager", "employee"] },
                isDeleted: false
            })
                .select("_id firstName lastName role basicSalary")
                .sort({
                    firstName: 1,
                    lastName: 1
                });

            let filteredUserIds = users.map(user => user._id);

            if (role) {
                filteredUserIds = users
                    .filter(user => user.role === role)
                    .map(user => user._id);
            }

            const payslipFilter = {
                organizationId: req.user.organization,
                userId: { $in: filteredUserIds }
            };

            if (month) payslipFilter.month = Number(month);

            if (year) payslipFilter.year = Number(year);

            const payslips = await Payslip.find(payslipFilter)
                .select(
                    "userId month year basicSalary netSalary"
                )
                .populate(
                    "userId",
                    "firstName lastName role"
                )
                .sort({
                    year: -1,
                    month: -1
                });

            return res.status(200).json({
                users,
                payslips
            });
        }


        // MANAGER / EMPLOYEE
        if (req.user.role === "manager" || req.user.role === "employee") {

            const payslips = await Payslip.find({
                organizationId: req.user.organization,
                userId: req.user.id
            })
            .sort({
                year: -1,
                month: -1
            })
            .select("month year basicSalary netSalary")

            return res.status(200).json({
                payslips
            });
        }
};

//Get payslip by  payslip ID
//GET /api/payslip/:id
export const getPayslipByID = async (req, res) => {
        const payslip = await Payslip.findById(req.params.id)
            .select("userId month year basicSalary allowances deductions netSalary")
            .populate("userId", "firstName lastName designation email organization")
            .lean();

        if(!payslip){
            throw new AppError("Payslip not found", 404);
        }
        // Employee -> Own Payslip
        if (req.user.role === "employee" && payslip.userId._id.toString() !== req.user.id) {
            throw new AppError("Forbidden", 403);
        }

        // Manager -> Own Payslip only
        if (req.user.role === "manager" &&
            payslip.userId._id.toString() !== req.user.id) {
            throw new AppError("Forbidden", 403);
        }

        // Admin -> Users in Same Organization
        if (req.user.role === "admin") {
            if (
                !payslip.userId ||
                payslip.userId.organization?.toString() !== req.user.organization.toString()
            ) {
                throw new AppError("Forbidden", 403);
            }
        }

        return res.json({
            id: payslip._id,
            month: payslip.month,
            year: payslip.year,
            basicSalary: payslip.basicSalary,
            allowances: payslip.allowances,
            deductions: payslip.deductions,
            netSalary: payslip.netSalary,
            employee: {
                firstName: payslip.userId.firstName,
                lastName: payslip.userId.lastName,
                designation: payslip.userId.designation,
                email: payslip.userId.email
            }
        });
}