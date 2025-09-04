// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

// Existing routes
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
import blogRoutes from "./routes/blogRoutes.js";

// NEW: Payments (no webhook), Packages CRUD, Transactions
import paymentsRouter from "./routes/paymentsRoutes.js";
import packagesRoutes from "./routes/packagesRoutes.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";

// Load environment variables
dotenv.config();

// Correctly get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app
const app = express();

// 1) Connect DB BEFORE mounting routes/middleware
await connectDB();

// 2) Standard middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// 3) Static folders
app.use("/thumbnails",  express.static(path.join(__dirname, "..", "thumbnails")));
app.use("/templates",   express.static(path.join(__dirname, "..", "templates")));
app.use("/images",      express.static(path.join(__dirname, "..", "images")));
app.use("/blog_images", express.static(path.join(__dirname, "..", "blog_images")));

// 4) API routes
app.use("/api/projects",     projectRoutes);
app.use("/api/auth",         authRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/file-gen",     fileGenRoutes);
app.use("/api/models",       aiModelRoutes);
app.use("/api/templates",    templateRoutes);
app.use("/api/categories",   categoryRoutes);
app.use("/api/playground",   playgroundRoutes);
app.use("/api/tools",        toolsRoutes);
app.use("/api/domains",      domainRoutes);
app.use("/api/blogs",        blogRoutes);

// NEW: Stripe (no webhook), Packages, Transactions
app.use("/api/payments",     paymentsRouter);
app.use("/api/packages",     packagesRoutes);
app.use("/api/transactions", transactionsRoutes);

// (optional) Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
