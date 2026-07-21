import {Router} from "express";
import { login, changePassword, registerOrg } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register-organization", registerOrg);
authRouter.post("/login", login);
authRouter.post("/change-password", protect, changePassword);

export default authRouter;