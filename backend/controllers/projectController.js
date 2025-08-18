// controllers/projectController.js
import Project from "../models/projectSchema.js";
import mongoose from 'mongoose';

// Controller to handle saving a new project
export const saveProject = async (req, res) => {
  try {
    const {
      projectName, // This will be the initially provided name (e.g., "Banking App")
      projectDescription,
      applicationTypes, // This can be used later if needed
      createdBy,
      generatedRequirements,
      modules,
    } = req.body;

    // Validate required fields
    if (!projectName || !projectDescription || !createdBy || !generatedRequirements || !applicationTypes || !Array.isArray(applicationTypes) || applicationTypes.length === 0) {
      return res.status(400).json({ message: "Missing required fields or invalid application types." });
    }

    let finalProjectName = projectName;
    let counter = 0;

    // --- START MODIFICATION ---

    // Check for existing projects with the same base name
    // We use a regex to find names that start with the projectName,
    // optionally followed by "-X" (where X is a number)
    const regex = new RegExp(`^${projectName}(?:-(\\d+))?$`);
    const existingProjects = await Project.find({ projectName: { $regex: regex } })
      .sort({ projectName: 1 }) // Sort to easily find the highest number
      .select('projectName'); // Only fetch the project name

    if (existingProjects.length > 0) {
      // If projects with similar names exist, find the highest counter
      let maxCounter = 0;
      existingProjects.forEach(project => {
        const match = project.projectName.match(new RegExp(`^${projectName}(?:-(\\d+))?$`));
        if (match && match[1]) { // If it matches the pattern "projectName-X"
          const currentCounter = parseInt(match[1], 10);
          if (!isNaN(currentCounter) && currentCounter > maxCounter) {
            maxCounter = currentCounter;
          }
        }
      });
      counter = maxCounter + 1;
      finalProjectName = `${projectName}-${counter}`;
    }

    // --- END MODIFICATION ---

    // Create a new project instance with the potentially modified name
    const newProject = new Project({
      projectName: finalProjectName, // Use the final, unique project name
      projectDescription,
      applicationTypes, // Store the application types
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
    // Be careful not to expose sensitive error details in production
    res.status(500).json({ message: "Failed to save project.", error: error.message });
  }
};

export const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Validate if projectId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "Invalid Project ID format." });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            // Respond with JSON if project is not found
            return res.status(404).json({ error: "Project not found." });
        }

        // Respond with the project data as JSON
        res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        // Respond with JSON on server error
        res.status(500).json({ error: "Internal server error while fetching project." });
    }
};