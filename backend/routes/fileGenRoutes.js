// backend/routes/fileGenRoutes.js
import express from "express";
import { generateNextAppFiles } from "../controllers/fileGenController.js";  // Import the controller

const router = express.Router();

// POST route for generating Next.js app and files based on requirements
router.post("/generate-app", generateNextAppFiles);

export default router;
