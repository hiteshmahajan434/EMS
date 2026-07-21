import { Router } from "express";
import { authorize, protect } from "../middlewares/authMiddleware.js";
import { getAdminDashboard, getEmployeeDashboard, getManagerDashboard } from "../controllers/dashboardController.js";

const dashboardRouter = Router();

dashboardRouter.get("/employee", protect, authorize("employee"), getEmployeeDashboard);
dashboardRouter.get("/manager", protect, authorize("manager"), getManagerDashboard);
dashboardRouter.get("/admin", protect, authorize("admin"), getAdminDashboard);

export default dashboardRouter;