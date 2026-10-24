import User from "../models/User.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

//Get Users
//GET /api/users

// Read filters (req.query)
// Build the where object
// Apply role-based restrictions
// Query MongoDB
// Return the response
export const getUsers = async (req, res) => {
    try {
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
                .sort({ createdAt: -1 })
                .lean();

            return res.status(200).json({
                employees
            });
        }

    } catch (error) {
        console.error("Get users error:", error);

        return res.status(500).json({
            error: "Failed to fetch users"
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
    try {
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
            return res.status(403).json({
                error: "You are not allowed to create this user role"
            });
        }

        let manager = null;

        if (req.user.role === "manager") {
            manager = req.user.id;
        } else if (role === "employee") {
            if (!mongoose.isValidObjectId(req.body.manager)) {
                return res.status(400).json({
                    error: "Please assign a manager to this employee"
                });
            }

            const assignedManager = await User.findOne({
                _id: req.body.manager,
                organization: req.user.organization,
                role: "manager",
                isDeleted: false
            }).select("_id");

            if (!assignedManager) {
                return res.status(400).json({
                    error: "Please select an active manager in your organization"
                });
            }

            manager = assignedManager._id;
        }

        const organization = req.user.organization;

        if(!firstName || !lastName || !email || !password || !joiningDate){
            return res.status(400).json({error: "Missing required fields"});
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

        return res.status(201).json({success: true, newUser});
    } catch (error) {
        if(error.code == 11000){
            return res.status(400).json({error: "Email already exists"});
        }
        console.log("Create employee error:", error);
        return res.status(500).json({error: "Failed to create employee"});
    }
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
    try {
         const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
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
    } catch (error) {
        if(error.code == 11000){
            return res.status(400).json({error: "Email already exists"});
        }
        console.log("Update employee error:", error);
        return res.status(500).json({error: "Failed to update user"});
    }
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
    try {
        const {id} = req.params;

        const user = await User.findById(id);

        if(!user){
            return res.status(404).json({error: "User not exists"});
        }

        if (user.isDeleted) {
            return res.status(400).json({
                error: "User is already deleted"
            });
        }

        user.isDeleted = true;
        user.status = "INACTIVE";

        await user.save();
        
        return res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({error: "Failed to delete user"});
    }
}
