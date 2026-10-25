import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Load environment variables
dotenv.config();

// Import your existing User model
import User from "./models/User.js";

const createSuperAdmin = async () => {
    try {
        // Validate required environment variables
        const { MONGODB_URI, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } =
            process.env;

        if (!MONGODB_URI || !SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
            throw new Error(
                "MONGODB_URI, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be configured."
            );
        }

        if (SUPER_ADMIN_PASSWORD.length < 12) {
            throw new Error(
                "Use a Super Admin password containing at least 12 characters."
            );
        }

        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");

        const email = SUPER_ADMIN_EMAIL.trim().toLowerCase();

        // Check whether a Super Admin already exists
        const existingSuperAdmin = await User.findOne({
            role: "superadmin",
        });

        if (existingSuperAdmin) {
            console.log(
                "A Super Admin already exists. No additional account was created."
            );
            return;
        }

        // Prevent accidentally converting an existing account
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error(
                "This email already belongs to a user. Choose a dedicated Super Admin email."
            );
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

        // Create the Super Admin account
        await User.create({
            firstName: "Hitesh",
            lastName: "Mahajan",
            email,
            password: hashedPassword,
            role: "superadmin",
            organizationId: null,
        });

        console.log("Super Admin account created successfully.");
        console.log(`Email: ${email}`);
        console.log("Password: [hidden]");
    } catch (error) {
        console.error("Super Admin initialization failed:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
};

createSuperAdmin();