// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors"; // Import CORS middleware
// import projectRoutes from "./routes/projectRoutes.js"; // Import the project routes
// import authRoutes from "./routes/authRoutes.js"; // Import the auth routes for login, signup, etc.

// // Load environment variables from .env file
// dotenv.config();

// // Create Express app
// const app = express();

// // Middleware to parse incoming JSON requests
// app.use(express.json());

// // Enable CORS for all origins (you can restrict it to specific domains if needed)
// app.use(cors()); // This allows your server to accept requests from other origins

// // MongoDB connection
// import connectToDatabase from "./config/db.js"; // Import the MongoDB connection function
// connectToDatabase(); // Connect to MongoDB

// // Use routes
// app.use("/api/projects", projectRoutes); // Route for saving projects
// app.use("/api/auth", authRoutes); // Auth routes for signup, login, etc.

// // Start the server
// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS middleware
import projectRoutes from "./routes/projectRoutes.js"; // Import the project routes
import authRoutes from "./routes/authRoutes.js"; // Import the auth routes for login, signup, etc.

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Enable CORS for all origins (you can restrict it to specific domains if needed)
app.use(cors()); // This allows your server to accept requests from other origins

// MongoDB connection
import connectToDatabase from "./config/db.js"; // Import the MongoDB connection function
connectToDatabase(); // Connect to MongoDB

// Use routes
app.use("/api/projects", projectRoutes); // Route for saving projects
app.use("/api/auth", authRoutes); // Auth routes for signup, login, forgot password, etc.

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
