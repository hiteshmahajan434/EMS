import User from "../models/User.js";
import Organization from "../models/Organization.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Register Organization
//POST /api/auth/register-organization
export const registerOrg = async (req, res) => {
    try {
        const {
            companyName, 
            companyEmail,
            phone,
            website,
            address,
            industry,
            admin
        } = req.body;

        if (!admin) {
            return res.status(400).json({error: "Admin details are required"});
        }

        const {
            firstName,
            lastName,
            email,
            password,
        } = admin;

        if (!companyName ||!companyEmail ||!phone ||!firstName ||!lastName ||!email ||!password) {
            return res.status(400).json({
                error: "All required fields are required"
            });
        }

        const existingOrg = await Organization.findOne({companyEmail});
        if(existingOrg){
            return res.status(400).json({error: "Organization email already exists"});
        }

        const existingAdmin = await User.findOne({email});
        if(existingAdmin){
            return res.status(400).json({error: "Admin email already exixts"});
        }

        const hashed = await bcrypt.hash(password, 10);
        
        const newOrganization = await Organization.create({
            companyEmail,
            companyName,
            phone,
            website,
            address,
            industry
        });

        const newAdmin = await User.create({
            firstName,
            lastName,
            email,
            password: hashed,
            role: "admin",
            organization: newOrganization._id
        });

        newOrganization.adminId = newAdmin._id;
        await newOrganization.save();

        return res.status(201).json({
            success: true,
            message: "Organization registered successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Registration failed"});
    }
}

//Login for employee and admin
//POST /api/auth/login
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({error: "Email and password are required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({error: "Invalid credentials"});
        }

        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            return res.status(401).json({error: "Invalid credentials"});
        }

        const payload = {
            id: user.id,
            role: user.role,
            email: user.email,
            organization: user.organization
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });

        return res.json({token});
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({error: "Login failed"});
    }
}

//Get session for employee and admin
//GET /api/auth/session
// export const session = (req, res) => {
//     const session = req.session;
//     return res.json({user: session});
// }

//Change password for employee and admin
//POST /api/auth/change-password
export const changePassword = async (req, res) => {
    try {
        const {currPassword, newPassword} = req.body;

        if(!currPassword || !newPassword){
            return res.status(400).json({error: "Both passwords are required"});
        }

        const userData = req.user;
        const userId = userData.id;

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const isValid = await bcrypt.compare(currPassword, user.password);
        if(!isValid){
            return res.status(400).json({error: "Current password is incorrect"});
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(userId, {password: hashed});

        return res.json({success: true});
    } catch (error) {
        return res.status(500).json({ error: "Failed to change password" });
    }
}