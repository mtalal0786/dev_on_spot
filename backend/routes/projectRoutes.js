// routes/projectRoutes.js
import express from "express";
import { saveProject } from "../controllers/projectController.js"; // Import the saveProject function from the controller

const router = express.Router();

// POST route to save a new project
router.post("/", saveProject); // Use the saveProject controller to handle the POST request

export default router;
