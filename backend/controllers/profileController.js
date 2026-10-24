import User from "../models/User.js";
import Organization from "../models/Organization.js";

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
    try {
        const userId = req.user.id;
        const user = await User.findById(userId)
            .select("-password")
            .populate(
                "organization",
                "companyName companyEmail phone website address industry"
            );

        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        
        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to fetch profile"});
    }
}

//Update Profile
//PUT /api/profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if(user.isDeleted){
            return res.status(403).json({error: "Your account is deactivated. You cannot update your profile."});
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
            return res.status(403).json({
                error: "Only admins can update organization details"
            });
        }

        if (managedEmployeeFields.some(hasField)) {
            return res.status(403).json({
                error: "Department, position, and basic salary must be updated by an administrator"
            });
        }

        for (const field of ["firstName", "lastName"]) {
            if (hasField(field) && (typeof req.body[field] !== "string" || !req.body[field].trim())) {
                return res.status(400).json({
                    error: `${field} is required`
                });
            }
        }

        for (const field of ["phone", "bio", "designation"]) {
            if (hasField(field) && typeof req.body[field] !== "string") {
                return res.status(400).json({
                    error: `${field} must be text`
                });
            }
        }

        if (hasField("joiningDate")) {
            const joiningDate = new Date(req.body.joiningDate);
            if (!req.body.joiningDate || Number.isNaN(joiningDate.getTime())) {
                return res.status(400).json({
                    error: "Enter a valid join date"
                });
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
                return res.status(403).json({
                    error: "Only admins can update organization details"
                });
            }

            for (const field of ["companyName", "companyPhone"]) {
                if (hasField(field) && (typeof req.body[field] !== "string" || !req.body[field].trim())) {
                    return res.status(400).json({
                        error: `${field} is required`
                    });
                }
            }

            for (const field of ["website", "address"]) {
                if (hasField(field) && typeof req.body[field] !== "string") {
                    return res.status(400).json({
                        error: `${field} must be text`
                    });
                }
            }

            if (hasField("industry") && req.body.industry !== "" && !INDUSTRIES.includes(req.body.industry)) {
                return res.status(400).json({
                    error: "Select a valid industry"
                });
            }

            organization = await Organization.findById(user.organization);
            if (!organization) {
                return res.status(404).json({
                    error: "Organization not found"
                });
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
    } catch (error) {
        console.error("Error updating profile", error);
        return res.status(500).json({error: "Failed to update profile"});
    }
}