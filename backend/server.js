import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocketServer } from "./services/socketServer.js";

const PORT = process.env.PORT || 4000;

// Connect to database and start server
await connectDB();

const server = createServer(app);
initializeSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});