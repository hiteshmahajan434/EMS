import Organization from "../models/Organization.js";
import User from "../models/User.js";
import AppError from "../middlewares/AppError.js";

const getOrganizationPayload = async (organization) => {
    const userCount = await User.countDocuments({
        organization: organization._id,
        isDeleted: false,
        role: { $in: ["admin", "manager", "employee"] }
    });

    return {
        _id: organization._id,
        companyName: organization.companyName,
        companyEmail: organization.companyEmail,
        phone: organization.phone,
        website: organization.website || "",
        address: organization.address || "",
        industry: organization.industry || "",
        isActive: organization.isActive ?? true,
        createdAt: organization.createdAt,
        userCount
    };
};

export const getDashboardStats = async (req, res) => {
    const [
        totalOrganizations,
        activeOrganizations,
        inactiveOrganizations,
        totalUsers,
        organizationCreationStats,
        organizationGrowth,
        userDistribution
    ] = await Promise.all([
        Organization.countDocuments(),
        Organization.countDocuments({ isActive: true }),
        Organization.countDocuments({ isActive: false }),
        User.countDocuments({
            role: { $in: ["admin", "manager", "employee"] },
            isDeleted: false
        }),
        Organization.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, month: "$_id", count: 1 } }
        ]),
        Organization.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        User.aggregate([
            {
                $match: {
                    organization: { $ne: null },
                    isDeleted: false,
                    role: { $in: ["admin", "manager", "employee"] }
                }
            },
            {
                $group: {
                    _id: "$organization",
                    users: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "organizations",
                    localField: "_id",
                    foreignField: "_id",
                    as: "organization"
                }
            },
            { $unwind: "$organization" },
            {
                $project: {
                    _id: 0,
                    name: "$organization.companyName",
                    users: 1
                }
            },
            { $sort: { users: -1, name: 1 } },
            { $limit: 8 }
        ])
    ]);

    const monthlyStats = organizationCreationStats.map((entry) => ({
        month: entry.month,
        organizations: entry.count
    }));

    const growth = [];
    let cumulative = 0;
    organizationGrowth.forEach((entry) => {
        cumulative += entry.count;
        growth.push({
            month: entry._id,
            organizations: cumulative
        });
    });

    const orgStatusChart = [
        { name: "Active", value: activeOrganizations },
        { name: "Inactive", value: inactiveOrganizations }
    ];

    return res.json({
        summary: {
            totalOrganizations,
            activeOrganizations,
            inactiveOrganizations,
            totalUsers
        },
        monthlyOrganizationStats: monthlyStats,
        activeInactiveBreakdown: orgStatusChart,
        organizationGrowth: growth,
        userDistribution: userDistribution
    });
};

export const getOrganizations = async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const search = String(req.query.search || "").trim();
    const statusFilter = req.query.status;

    const filters = {};

    if (search) {
        filters.$or = [
            { companyName: { $regex: search, $options: "i" } },
            { companyEmail: { $regex: search, $options: "i" } }
        ];
    }

    if (statusFilter === "active") {
        filters.isActive = true;
    } else if (statusFilter === "inactive") {
        filters.isActive = false;
    }

    const total = await Organization.countDocuments(filters);
    const organizations = await Organization.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const results = await Promise.all(organizations.map((organization) => getOrganizationPayload(organization)));

    return res.json({
        organizations: results,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit))
        }
    });
};

export const toggleOrganizationStatus = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
        throw new AppError("Organization ID is required", 400);
    }

    if (typeof isActive !== "boolean") {
        throw new AppError("A valid status value is required", 400);
    }

    const organization = await Organization.findById(id);
    if (!organization) {
        throw new AppError("Organization not found", 404);
    }

    organization.isActive = isActive;
    await organization.save();

    return res.json({
        success: true,
        message: isActive
            ? "Organization activated successfully"
            : "Organization deactivated successfully",
        organization: {
            _id: organization._id,
            isActive: organization.isActive,
            companyName: organization.companyName
        }
    });
};
