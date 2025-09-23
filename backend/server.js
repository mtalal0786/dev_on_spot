// backend/server.js
import "dotenv/config";           // load env first
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { setupSocket } from "./realtime/socket.js";

const port = process.env.PORT || 5000;

// 1) Connect DB BEFORE starting server
await connectDB();

// 2) Create HTTP server & attach Socket.IO
const server = http.createServer(app);
const socket = setupSocket(server);

// 3) Expose socket helper (used by mock streamer to emit events)
global.__SOCKET__ = socket;

// 4) Listen
server.listen(port, () => {
  console.log(`🚀 Server running on ${port}`);
});
