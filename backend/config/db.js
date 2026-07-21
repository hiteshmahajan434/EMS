import mongoose from "mongoose";

async function connectDB(){
    try{
        mongoose.connection.on("connected", function(){
            console.log("Database Connected");
        });
        await mongoose.connect(process.env.MONGODB_URI);
    }
    catch(error){
        console.error("Database connection failed:", error.message);
        process.exit(1); // if connection failed server will be stopped by this line else it will be running even connection fails
    }
};

export default connectDB;