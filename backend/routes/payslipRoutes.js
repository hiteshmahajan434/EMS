import { Router } from "express";
import { authorize, protect } from "../middlewares/authMiddleware.js";
import { createPayslip, getPayslipByID, getPayslips } from "../controllers/payslipController.js";

const payslipRouter = Router();

payslipRouter.post("/", protect, authorize("manager", "admin"), (createPayslip));
payslipRouter.get("/", protect, authorize("employee", "manager", "admin"), getPayslips);
payslipRouter.get("/:id", protect, authorize("employee", "manager", "admin"), getPayslipByID);

export default payslipRouter;