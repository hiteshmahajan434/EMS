import User from "../models/User.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import sendEmail from "../config/nodemailer.js";
import AppError from "../middlewares/AppError.js";

const getManageableUserFilter = (req, id) => {
    if (!req.user.organization) {
        throw new AppError("Forbidden", 403);
    }

    const filter = {
        _id: id,
        organization: req.user.organization
    };

    if (req.user.role === "admin") {
        filter.role = { $in: ["employee", "manager"] };
    } else if (req.user.role === "manager") {
        filter.role = "employee";
        filter.manager = req.user.id;
    } else {
        throw new AppError("Forbidden", 403);
    }

    return filter;
};

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

//Get Users
//GET /api/users

// Read filters (req.query)
// Build the where object
// Apply role-based restrictions
// Query MongoDB
// Return the response
export const getUsers = async (req, res) => {
        const { department, manager, role } = req.query;

        // =========================
        // ADMIN
        // =========================
        if (req.user.role === "admin") {

            // Managers page
            if (role === "manager") {

                const managers = await User.find({
                    organization: req.user.organization,
                    role: "manager",
                    ...(department && { department })
                })
                    .select("_id firstName lastName department")
                    .sort({ createdAt: -1 })
                    .lean();

                return res.status(200).json({
                    managers
                });
            }

            // Employees page
            const managers = await User.find({
                organization: req.user.organization,
                role: "manager",
                isDeleted: false,
            })
            .select("_id firstName lastName")
            .sort({ firstName: 1 })
            .lean();

            const employeeFilter = {
                organization: req.user.organization,
                role: "employee",
            };

            if (department) {
                employeeFilter.department = department;
            }

            if (manager) {
                employeeFilter.manager = manager;
            }

            const employees = await User.find(employeeFilter)
                .select("_id firstName lastName email phone role organization manager basicSalary status isDeleted department designation joiningDate bio")
                .sort({ createdAt: -1 })
                .lean();

            return res.status(200).json({
                managers,
                employees
            });
        }


        // =========================
        // MANAGER
        // =========================
        if (req.user.role === "manager") {

            const employeeFilter = {
                organization: req.user.organization,
                role: "employee",
                manager: req.user.id,
            };

            if (department) {
                employeeFilter.department = department;
            }

            const employees = await User.find(employeeFilter)
                .select("_id firstName lastName email phone role organization manager basicSalary status isDeleted department designation joiningDate bio")
                .sort({ createdAt: -1 })
                .lean();

            return res.status(200).json({
                employees
            });
        }

};

//Create Users
//POST /api/users
// Read request body
// Validate required fields
// Check permissions (admin/manager)
// Hash password
// Create employee
// Return 201 Created
export const createUser = async (req, res) => {
        const {
            firstName, 
            lastName,
            email,
            phone,
            role,
            password,
            basicSalary,
            department,
            designation,
            joiningDate,
            profilePicture,
            bio
        } = req.body;

        if (
            (req.user.role === "manager" && role !== "employee") ||
            (req.user.role === "admin" && !["employee", "manager"].includes(role))
        ) {
            throw new AppError("You are not allowed to create this user role", 403);
        }

        let manager = null;

        if (req.user.role === "manager") {
            manager = req.user.id;
        } else if (role === "employee") {
            if (!mongoose.isValidObjectId(req.body.manager)) {
                throw new AppError("Please assign a manager to this employee", 400);
            }

            const assignedManager = await User.findOne({
                _id: req.body.manager,
                organization: req.user.organization,
                role: "manager",
                isDeleted: false
            }).select("_id");

            if (!assignedManager) {
                throw new AppError("Please select an active manager in your organization", 400);
            }

            manager = assignedManager._id;
        }

        const organization = req.user.organization;

        if(!firstName || !lastName || !email || !password || !joiningDate){
            throw new AppError("Missing required fields", 400);
        }

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashed,
            phone,
            role,
            organization,
            manager,
            basicSalary,
            status: "ACTIVE",
            isDeleted: false,
            department,
            designation,
            joiningDate: new Date(joiningDate),
            profilePicture,
            bio,
        });

        let welcomeEmailSent = null;
        if (req.user.role === "admin") {
            const frontendUrl = (
                process.env.FRONTEND_URL || "http://localhost:5173"
            ).replace(/\/+$/, "");
            const loginUrl = `${frontendUrl}/login`;
            const safeFirstName = escapeHtml(firstName);
            const safeLastName = escapeHtml(lastName);
            const roleName = role === "manager" ? "Manager" : "Employee";

            try {
                await sendEmail({
                    to: email,
                    subject: "Welcome to OneCore",
                    body: `
                        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
                            <p>Hi ${safeFirstName},</p>
                            <p>Welcome to OneCore EMS!</p>
                            <p>Your account has been created successfully. You can use the following credentials to log in.</p>
                            <h3>Account Details</h3>
                            <ul>
                                <li><strong>Name:</strong> ${safeFirstName} ${safeLastName}</li>
                                <li><strong>Role:</strong> ${roleName}</li>
                                <li><strong>Login Email:</strong> ${escapeHtml(email)}</li>
                                <li><strong>Temporary Password:</strong> ${escapeHtml(password)}</li>
                            </ul>
                            <h3>How to get started</h3>
                            <ol>
                                <li>Open OneCore EMS using the login link below.</li>
                                <li>Log in using your email and temporary password.</li>
                                <li>Change the temporary password after login.</li>
                            </ol>
                            <p><strong>Login here:</strong> <a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></p>
                            <p>For your security, please change your temporary password immediately after logging in. Do not share your credentials with anyone.</p>
                            <p>Welcome aboard!</p>
                            <p>Best regards,<br />OneCore</p>
                        </div>
                    `
                });
                welcomeEmailSent = true;
            } catch (emailError) {
                console.error("Failed to send new-account welcome email:", emailError);
                welcomeEmailSent = false;
            }
        }

        const userResponse = newUser.toObject();
        delete userResponse.password;
        delete userResponse.tokenVersion;

        return res.status(201).json({
            success: true,
            newUser: userResponse,
            welcomeEmailSent,
            message: welcomeEmailSent === false
                ? "Account created, but the welcome email could not be sent"
                : undefined
        });
}

//Update user
//PUT /api/users/:id
// Get employee ID
// Find employee
// Verify ownership/permissions
// Update allowed fields
// Hash password only if supplied
// Save
// Return success
export const updateUser = async (req, res) => {
         const { id } = req.params;

        const user = await User.findOne(getManageableUserFilter(req, id));

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            basicSalary,
            department,
            designation,
            joiningDate,
            profilePicture,
            bio,
            status
        } = req.body;

        if (req.user.role === "manager") {
            const hasEmail = Object.prototype.hasOwnProperty.call(req.body, "email");
            if (hasEmail && typeof email !== "string") {
                throw new AppError("Email must be text", 400);
            }

            if ((hasEmail && email.toLowerCase() !== user.email) || password) {
                throw new AppError("Managers cannot change employee credentials", 403);
            }
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (department) user.department = department;
        if (designation) user.designation = designation;
        if (joiningDate) user.joiningDate = new Date(joiningDate);
        if (profilePicture) user.profilePicture = profilePicture;
        if (bio) user.bio = bio;

        if (basicSalary !== undefined) {
            user.basicSalary = Number(basicSalary);
        }

        if (status) {
            user.status = status;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        return res.json({success: true});
}

//Delete User
//DELETE /api/users/:id
// Get employee ID
// Find employee
// Verify ownership
// Soft delete (isDeleted = true)
// Set status to INACTIVE
// Save
// Return success
export const deleteUser = async (req, res) => {
        const {id} = req.params;

        const user = await User.findOne(getManageableUserFilter(req, id));

        if(!user){
            throw new AppError("User not exists", 404);
        }

        if (user.isDeleted) {
            throw new AppError("User is already deleted", 400);
        }

        user.isDeleted = true;
        user.status = "INACTIVE";

        await user.save();
        
        return res.json({
            success: true,
            message: "User deleted successfully"
        });
}
