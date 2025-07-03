// models/projectSchema.js
import mongoose from "mongoose";

// Define the schema for a project
const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectDescription: { type: String, required: true },
  createdBy: { type: String, required: true }, // You could store the user ID here if needed
  generatedRequirements: { type: String, required: true }, // Final updated requirements
  modules: { type: [String], default: [] }, // List of suggested modules (optional, commented out for now)
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Create a model based on the schema
const Project = mongoose.model("Project", ProjectSchema);

export default Project;
