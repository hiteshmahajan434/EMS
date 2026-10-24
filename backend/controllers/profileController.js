import User from "../models/User.js";
import Organization from "../models/Organization.js";
import AppError from "../middlewares/AppError.js";

const INDUSTRIES = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Construction",
    "Hospitality",
    "Other"
];

//Get Profile
//GET /api/profile
export const getProfile = async (req, res) => {
        const userId = req.user.id;
        const user = await User.findById(userId)
            .select("-password")
            .populate(
                "organization",
                "companyName companyEmail phone website address industry"
            );

        if(!user){
            throw new AppError("User not found", 404);
        }
        
        return res.json(user);
}

//Update Profile
//PUT /api/profile
export const updateProfile = async (req, res) => {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if(!user){
            throw new AppError("User not found", 404);
        }

        if(user.isDeleted){
            throw new AppError("Your account is deactivated. You cannot update your profile.", 403);
        }

        const userFields = [
            "firstName",
            "lastName",
            "phone",
            "bio"
        ];
        const employeeFields = [
            "joiningDate",
        ];
        const managedEmployeeFields = [
            "department",
            "designation",
            "basicSalary"
        ];
        const organizationFields = [
            "companyName",
            "companyPhone",
            "website",
            "address",
            "industry"
        ];
        const hasField = (field) =>
            Object.prototype.hasOwnProperty.call(req.body, field);
        const hasOrganizationUpdates = organizationFields.some(hasField);
        const isEmployeeOrManager = ["employee", "manager"].includes(user.role);

        if (isEmployeeOrManager && organizationFields.some(hasField)) {
            throw new AppError("Only admins can update organization details", 403);
        }

        if (managedEmployeeFields.some(hasField)) {
            throw new AppError("Department, position, and basic salary must be updated by an administrator", 403);
        }

        for (const field of ["firstName", "lastName"]) {
            if (hasField(field) && (typeof req.body[field] !== "string" || !req.body[field].trim())) {
                throw new AppError(`${field} is required`, 400);
            }
        }

        for (const field of ["phone", "bio", "designation"]) {
            if (hasField(field) && typeof req.body[field] !== "string") {
                throw new AppError(`${field} must be text`, 400);
            }
        }

        if (hasField("joiningDate")) {
            const joiningDate = new Date(req.body.joiningDate);
            if (!req.body.joiningDate || Number.isNaN(joiningDate.getTime())) {
                throw new AppError("Enter a valid join date", 400);
            }
            user.joiningDate = joiningDate;
        }

        for (const field of ["firstName", "lastName", "phone", "bio"]) {
            if (hasField(field)) {
                user[field] = typeof req.body[field] === "string"
                    ? req.body[field].trim()
                    : req.body[field];
            }
        }

        let organization;
        if (hasOrganizationUpdates) {
            if (user.role !== "admin") {
                throw new AppError("Only admins can update organization details", 403);
            }

            for (const field of ["companyName", "companyPhone"]) {
                if (hasField(field) && (typeof req.body[field] !== "string" || !req.body[field].trim())) {
                    throw new AppError(`${field} is required`, 400);
                }
            }

            for (const field of ["website", "address"]) {
                if (hasField(field) && typeof req.body[field] !== "string") {
                    throw new AppError(`${field} must be text`, 400);
                }
            }

            if (hasField("industry") && req.body.industry !== "" && !INDUSTRIES.includes(req.body.industry)) {
                throw new AppError("Select a valid industry", 400);
            }

            organization = await Organization.findById(user.organization);
            if (!organization) {
                throw new AppError("Organization not found", 404);
            }

            if (hasField("companyName")) organization.companyName = req.body.companyName.trim();
            if (hasField("companyPhone")) organization.phone = req.body.companyPhone.trim();
            if (hasField("website")) organization.website = req.body.website.trim();
            if (hasField("address")) organization.address = req.body.address.trim();
            if (hasField("industry")) organization.industry = req.body.industry;
        }

        const hasUserUpdates = userFields.some(hasField) || employeeFields.some(hasField);
        if (hasUserUpdates) {
            await user.save();
        }

        if (organization) {
            await organization.save();
        }

        return res.json({ success: true, message: "Profile updated successfully" });
}