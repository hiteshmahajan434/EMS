import { Router } from "express";
import { authorize, protect } from "../middlewares/authMiddleware.js";
import { clockInOut, getMyAttendance, getTeamAttendance, getUserAttendance } from "../controllers/attendanceController.js";

const attendanceRouter = Router();

attendanceRouter.post("/clock", protect, authorize("employee", "manager"), clockInOut);
attendanceRouter.get("/my", protect, authorize("employee", "manager"), getMyAttendance);
attendanceRouter.get("/team", protect, authorize("manager", "admin"), getTeamAttendance);
attendanceRouter.get("/team/:id", protect, authorize("manager", "admin"), getUserAttendance);

export default attendanceRouter;