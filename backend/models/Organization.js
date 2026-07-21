import mongoose from "mongoose";

const organizationSchema = mongoose.Schema(
    {
        companyName: {type: String, required: true},
        companyEmail: {type: String, required: true, unique: true, lowercase: true},
        phone: {type: String, required: true},
        website: {type: String, default: ""},
        address: {type: String, default: ""},
        industry: {type: String, default: ""},
        adminId: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
    },
    {
        timestamps: true
    }
);

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;