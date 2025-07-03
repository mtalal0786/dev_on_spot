// controllers/projectController.js
import Project from "../models/projectSchema.js";

// Controller to handle saving a new project
export const saveProject = async (req, res) => {
  try {
    const {
      projectName,
      projectDescription,
      createdBy,
      generatedRequirements,
      modules,
    } = req.body;

    // Validate required fields
    if (!projectName || !projectDescription || !createdBy || !generatedRequirements) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Create a new project instance
    const newProject = new Project({
      projectName,
      projectDescription,
      createdBy,
      generatedRequirements,
      modules: modules || [],
    });

    // Save the project to the database
    const savedProject = await newProject.save();

    res.status(201).json({
      message: "Project saved successfully.",
      project: savedProject,
    });
  } catch (error) {
    console.error("Error saving project:", error);
    res.status(500).json({ message: "Failed to save project.", error: error.message });
  }
};