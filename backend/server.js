import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import blogRoutes from "./routes/blogRoutes.js"; // Import the blog routes

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Correctly get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the designated folders
app.use("/thumbnails", express.static(path.join(__dirname, '..', 'thumbnails')));
app.use("/templates", express.static(path.join(__dirname, '..', 'templates')));
app.use("/images", express.static(path.join(__dirname, '..', 'images')));
app.use("/blog_images", express.static(path.join(__dirname, '..', 'blog_images'))); // This line serves the images

// Use all routes
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import requirementRoutes from "./routes/requirementsRoutes.js";
import fileGenRoutes from "./routes/fileGenRoutes.js";
import aiModelRoutes from "./routes/aiModelRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import playgroundRoutes from "./routes/playgroundRoutes.js";
import toolsRoutes from "./routes/toolsRoutes.js";
import domainRoutes from "./routes/domainRoutes.js";

app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/file-gen", fileGenRoutes);
app.use("/api/models", aiModelRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/playground', playgroundRoutes);
app.use('/api/tools', toolsRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/blogs", blogRoutes); // This line uses the blog routes

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
