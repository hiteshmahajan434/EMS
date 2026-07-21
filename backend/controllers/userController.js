import User from "../models/User.js";
import bcrypt from "bcrypt";

//Get Users
//GET /api/users

// Read filters (req.query)
// Build the where object
// Apply role-based restrictions
// Query MongoDB
// Return the response
export const getUsers = async (req, res) => {
    try {
        const {department} = req.query;
        const filter = {};
        if(department){ // If department exists then search by department else all employees
            filter.department = department;
        }
        if(req.user.role == "admin"){
            filter.organization = req.user.organization;
            filter.role = { $in: ["manager", "employee"] }; //Only Manager and employee of same organization
        }
        if(req.user.role == "manager"){
            filter.manager = req.user.id;
        }

        const users = await User.find(filter)
            .sort({createdAt: -1})
            .lean();
        
        return res.json(users);
    } catch (error) {
        return res.status(500).json({error: "Failed to fetch employees"});
    }
}

//Create Users
//POST /api/user
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
            password,
            basicSalary,
            department,
            designation,
            joiningDate,
            profilePicture,
            bio
        } = req.body;

        let manager = null, role = null;

        if(req.user.role == "manager"){
            manager = req.user.id;
            role = "employee";
        }
        if(req.user.role == "admin"){
            role = "manager";
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
//PUT /api/user/:id
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
//DELETE /api/user/:id
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
        
        return res.json({success: true});
    } catch (error) {
        return res.status(500).json({error: "Failed to delete user"});
    }
}
