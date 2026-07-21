import { Router } from "express";
import { authorize, protect } from "../middlewares/authMiddleware.js";
import { createLeave, getLeave, getMyLeave, updateLeave } from "../controllers/leaveController.js";

const leaveRouter = Router();

leaveRouter.post("/", protect, authorize("employee", "manager"), createLeave);
leaveRouter.get("/my", protect, authorize("employee", "manager"), getMyLeave);
leaveRouter.get("/", protect, authorize("manager", "admin"), getLeave);
leaveRouter.patch("/:id", protect, authorize("manager", "admin"), updateLeave);

export default leaveRouter;