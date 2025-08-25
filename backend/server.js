import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

// Import and connect to MongoDB
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Correctly get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add the middleware to serve files from the templates and thumbnails folders.
app.use("/thumbnails", express.static(path.join(__dirname, '..', 'thumbnails')));
app.use("/templates", express.static(path.join(__dirname, '..', 'templates')));


// Use routes
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

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
