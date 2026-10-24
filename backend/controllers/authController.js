import User from "../models/User.js";
import Organization from "../models/Organization.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from "../config/nodemailer.js";

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

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

        let welcomeEmailSent = true;
        try {
            await sendEmail({
                to: newAdmin.email,
                subject: "Welcome to OneCore!",
                body: `
                    <div style="max-width: 600px; font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Welcome to OneCore EMS, ${escapeHtml(newAdmin.firstName)}!</h2>
                        <p>Your organization has been successfully registered on OneCore EMS.</p>
                        <p>You can now log in using your registered email address and the password you created during registration.</p>
                        <p>As your organization's administrator, you can:</p>
                        <ul>
                            <li>Manage employees and managers</li>
                            <li>Monitor attendance</li>
                            <li>Review leave applications</li>
                            <li>Manage payslips</li>
                        </ul>
                        <p>We're excited to have you on board!</p>
                        <p>Best regards,<br/><strong>OneCore</strong></p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error("Failed to send organization admin welcome email:", emailError);
            welcomeEmailSent = false;
        }

        return res.status(201).json({
            success: true,
            message: welcomeEmailSent
                ? "Organization registered successfully"
                : "Organization registered successfully, but the welcome email could not be sent",
            welcomeEmailSent
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
        const {email, password, portalRole} = req.body;

        if(!email || !password || !["admin", "employee"].includes(portalRole)){
            return res.status(400).json({error: "Email, password, and a valid login portal are required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({error: "Invalid credentials"});
        }

        if (user.isDeleted) {
            return res.status(403).json({
                error: "Your account has been deleted. You cannot log in."
            });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            return res.status(401).json({error: "Invalid credentials"});
        }

        const allowedRoles = portalRole === "admin"
            ? ["admin"]
            : ["employee", "manager"];

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                error: "This account cannot access the selected portal"
            });
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

// GET /api/auth/session
export const session = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.json({
            user
        });
    } catch (error) {
        console.error("Session error:", error);

        return res.status(500).json({
            error: "Failed to fetch session"
        });
    }
};

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

        return res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to change password" });
    }
}