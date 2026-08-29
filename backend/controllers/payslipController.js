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

        // Only Admin can generate payslips
        if (req.user.role !== "admin") {
            return res.status(403).json({
                error: "Only admin can generate payslips"
            });
        }

        // Admin can generate only for users in the same organization
        if (user.organization.toString() !== req.user.organization.toString()) {
            return res.status(403).json({
                error: "User does not belong to your organization"
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

//GET /api/payslip
export const getPayslips = async (req, res) => {
    try {
        // ADMIN
        if (req.user.role === "admin") {

            const { month, year, role } = req.query;

            const users = await User.find({
                organization: req.user.organization,
                role: { $in: ["manager", "employee"] },
                isDeleted: false
            })
                .select("_id firstName lastName role")
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
    } catch (error) {
        console.error("Get Payslips Error:", error);

        return res.status(500).json({
            error: "Failed to fetch payslips"
        });
    }
};

//Get payslip by  payslip ID
//GET /api/payslip/:id
export const getPayslipByID = async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id)
            .select("userId month year basicSalary allowances deductions netSalary")
            .populate("userId", "firstName lastName position email organization")
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

        // Manager -> Own Payslip only
        if (req.user.role === "manager" &&
            payslip.userId._id.toString() !== req.user.id) {
            return res.status(403).json({
                error: "Forbidden"
            });
        }

        // Admin -> Users in Same Organization
        if (req.user.role === "admin") {
            if (
                !payslip.userId ||
                payslip.userId.organization?.toString() !== req.user.organization.toString()
            ) {
                return res.status(403).json({
                    error: "Forbidden"
                });
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
                position: payslip.userId.position,
                email: payslip.userId.email
            }
        });
    } catch (error) {
        return res.status(500).json({error: "Failed to fetch payslip"});
    }
}