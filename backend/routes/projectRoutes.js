// routes/projectRoutes.js
import express from "express";
import { saveProject,getProjectById } from "../controllers/projectController.js"; // Import the saveProject function from the controller

const router = express.Router();

// POST route to save a new project
router.post("/", saveProject); // Use the saveProject controller to handle the POST request
// GET route to fetch a project by ID
router.get("/:projectId", getProjectById); // Use the getProjectById controller to handle the GET request


export default router;
