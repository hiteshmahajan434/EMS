import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getDashboard } from "../controllers/dashboardController.js";

const dashboardRouter = Router();

dashboardRouter.get("/", protect, getDashboard);

export default dashboardRouter;