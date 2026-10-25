import User from "../models/User.js";
import Organization from "../models/Organization.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from "../config/nodemailer.js";
import AppError from "../middlewares/AppError.js";

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
        throw new AppError("Admin details are required", 400);
    }

    const {
        firstName,
        lastName,
        email,
        password,
    } = admin;

    if (!companyName || !companyEmail || !phone || !firstName || !lastName || !email || !password) {
        throw new AppError("All required fields are required", 400);
    }

    const existingOrg = await Organization.findOne({ companyEmail });
    if (existingOrg) {
        throw new AppError("Organization email already exists", 409);
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
        throw new AppError("Admin email already exists", 409);
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
}

//Login for employee and admin
//POST /api/auth/login
export const login = async (req, res) => {
    const { email, password, portalRole } = req.body;

    if (!email || !password || !["admin", "employee", "superadmin"].includes(portalRole)) {
        throw new AppError("Email, password, and a valid login portal are required", 400);
    }

    const user = await User.findOne({ email }).select("+password +tokenVersion");
    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    if (user.isDeleted) {
        throw new AppError("Your account has been deleted. You cannot log in.", 403);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new AppError("Invalid credentials", 401);
    }

    if (user.role === "superadmin") {
        if (portalRole !== "superadmin") {
            throw new AppError("This account cannot access the selected portal", 403);
        }
    } else if (user.role === "admin") {
        if (portalRole !== "admin") {
            throw new AppError("This account cannot access the selected portal", 403);
        }
    } else {
        const allowedRoles = portalRole === "admin"
            ? ["admin"]
            : ["employee", "manager"];

        if (!allowedRoles.includes(user.role)) {
            throw new AppError("This account cannot access the selected portal", 403);
        }
    }

    if (user.role !== "superadmin" && user.organization) {
        const organization = await Organization.findById(user.organization);
        if (!organization || !organization.isActive) {
            throw new AppError("Your organization has been deactivated. Please contact the Super Admin.", 403);
        }
    }

    const payload = {
        id: user.id,
        role: user.role,
        email: user.email,
        organization: user.organization,
        tokenVersion: user.tokenVersion ?? 0
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d"
    });

    return res.json({ token });
}

// GET /api/auth/session
export const session = async (req, res) => {
    const user = await User.findById(req.user.id)
        .select("-password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return res.json({ user });
};

//Change password for employee and admin
//POST /api/auth/change-password
export const changePassword = async (req, res) => {
    const { currPassword, newPassword } = req.body;

    if (!currPassword || !newPassword) {
        throw new AppError("Both passwords are required", 400);
    }

    const userId = req.user.id;

    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isValid = await bcrypt.compare(currPassword, user.password);
    if (!isValid) {
        throw new AppError("Current password is incorrect", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: { password: hashed },
            $inc: { tokenVersion: 1 }
        },
        { returnDocument: "after" }
    ).select("+tokenVersion");

    if (!updatedUser) {
        throw new AppError("User not found", 404);
    }

    const token = jwt.sign({
        id: user.id,
        role: user.role,
        email: user.email,
        organization: user.organization,
        tokenVersion: updatedUser.tokenVersion
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d"
    });

    return res.json({
        success: true,
        message: "Password changed successfully",
        token
    });
}