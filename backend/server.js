import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import payslipRouter from "./routes/payslipRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

//Middleware
app.use(cors()); //All requests will be parsed through cors
app.use(express.json());
app.use(multer().none());

//Routes
app.get("/", function(req, res){
    res.send("Server is running");
})

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/payslip", payslipRouter);
app.use("/api/dashboard", dashboardRouter);

await connectDB();

app.listen(PORT, function(){
    console.log(`Server running on port ${PORT}`);
});