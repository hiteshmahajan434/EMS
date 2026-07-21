import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const userRouter = Router();

userRouter.get("/", protect, authorize("manager", "admin"), getUsers);
userRouter.post("/", protect, authorize("manager", "admin"), createUser);
userRouter.put("/:id", protect, authorize("manager", "admin"), updateUser);
userRouter.delete("/:id", protect, authorize("manager", "admin"), deleteUser);

export default userRouter;