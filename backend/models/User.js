import mongoose from "mongoose";
import { DEPARTMENTS } from "../constants/departments.js";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["superadmin", "admin", "manager", "employee"],
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        default: null,
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    basicSalary: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
    department: {
        type: String,
        default: "Engineering",
        enum: DEPARTMENTS
    },
    designation: {
        type: String,
        default: "",
    },
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    profilePicture: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: ""
    }
}, { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;