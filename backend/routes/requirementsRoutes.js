// routes/requirementsRoutes.js
import express from "express";
import { generateRequirements, insertModule, getSuggestedModules } from "../controllers/requirementsController.js";

const router = express.Router();

// Define POST routes for each API endpoint
router.post("/generate", generateRequirements);
router.post("/insert-module", insertModule);
router.post("/suggest-modules", getSuggestedModules);

export default router;
