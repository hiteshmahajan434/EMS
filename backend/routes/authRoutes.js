import {Router} from "express";
import { login, changePassword, registerOrg, session } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register-organization", registerOrg);
authRouter.post("/login", login);
authRouter.post("/change-password", protect, changePassword);
authRouter.get("/session", protect, session);

export default authRouter;