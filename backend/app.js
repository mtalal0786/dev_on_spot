// backend/app.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

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

// Infra module (existing)
import instanceRoutes from "./routes/instanceRoutes.js";
import quotaRoutes from "./routes/quotaRoutes.js";
import infraAlertRoutes from "./routes/infraAlertRoutes.js";
import metricRoutes from "./routes/metricRoutes.js";
import { start as startSimulator } from "./services/simulatorService.js";

// 🔐 NEW: Security module routes (ESM)
import securityRoutes from "./routes/securityRoutes.js";
import securityAlertsRoutes from "./routes/securityAlertsRoutes.js";
import certificatesRoutes from "./routes/certificatesRoutes.js";
import firewallsRoutes from "./routes/firewallsRoutes.js";
import securityPlanRoutes from "./routes/securityPlanRoutes.js";
import loginAttemptsRoutes from "./routes/loginAttemptsRoutes.js";
import malwareRoutes from "./routes/malwareRoutes.js";
import simulateRoutes from "./routes/simulateRoutes.js";
// NEW mounts for plan submodules
import listsRoutes from "./routes/listsRoutes.js";
import rateLimitRoutes from "./routes/rateLimitRoutes.js";
import loginPolicyRoutes from "./routes/loginPolicyRoutes.js";
import scanRoutes from './routes/scanRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';

import pluginRoutes from "./routes/pluginRoutes.js";

// __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app
const app = express();

// Standard middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Static folders
app.use("/thumbnails",  express.static(path.join(__dirname, "..", "thumbnails")));
app.use("/templates",   express.static(path.join(__dirname, "..", "templates")));
app.use("/images",      express.static(path.join(__dirname, "..", "images")));
app.use("/blog_images", express.static(path.join(__dirname, "..", "blog_images")));

// API routes (existing)
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

// Existing infra simulators
app.use("/api/infrastructure/instances", instanceRoutes);
app.use("/api/infrastructure/quotas",    quotaRoutes);
app.use("/api/infrastructure/alerts",    infraAlertRoutes);
app.use("/api/infrastructure/metrics",   metricRoutes);

// 🔐 NEW: Security module routes (match your frontend fetches)
app.use("/api/security",              securityRoutes);        // /overview, /email-alerts
app.use("/api/security/alerts",       securityAlertsRoutes);          // list & create (mock/webhook)
app.use("/api/security/certificates", certificatesRoutes);    // filters/sort/pagination
app.use("/api/security/firewalls",    firewallsRoutes);       // filters/sort/pagination
app.use("/api/security/plans",        securityPlanRoutes);           // CRUD
app.use("/api/security/login-attempts", loginAttemptsRoutes);
app.use("/api/security/malware",        malwareRoutes);
app.use("/api/security/simulate",       simulateRoutes);
// NEW mounts for plan submodules
app.use("/api/security/lists",        listsRoutes);
app.use("/api/security/rate-limit",   rateLimitRoutes);
app.use("/api/security/login-policy", loginPolicyRoutes);
app.use("/api/security/scan",   scanRoutes);
app.use("/api/security/traffic",   trafficRoutes);

// NEW: Plugins
app.use("/api/plugins", pluginRoutes);


// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Start your existing infra simulator (safe to start here; it uses timers)
startSimulator(60_000); // or 30_000 for faster ticks

export default app;
