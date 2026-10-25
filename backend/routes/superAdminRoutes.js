import { Router } from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { getDashboardStats, getOrganizations, toggleOrganizationStatus } from "../controllers/superAdminController.js";

const superAdminRouter = Router();

superAdminRouter.use(protect, authorize("superadmin"));

superAdminRouter.get("/dashboard", getDashboardStats);
superAdminRouter.get("/organizations", getOrganizations);
superAdminRouter.patch("/organizations/:id/status", toggleOrganizationStatus);

export default superAdminRouter;
