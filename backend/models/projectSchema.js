import mongoose from "mongoose";

// Define a sub-schema for individual files within a project
const FileSchema = new mongoose.Schema({
    filePath: { type: String, required: true }, // e.g., 'src/components/Button.jsx'
    fileName: { type: String, required: true }, // e.g., 'Button.jsx'
    fileExtension: { type: String, required: true }, // e.g., 'jsx', 'ts', 'py', 'css'
    fileLanguage: { type: String, required: true }, // e.g., 'javascript', 'typescript', 'python', 'css'
    fileContent: { type: String, default: '' }, // The actual code content generated for this file
});

// Define the main schema for a project
const ProjectSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    projectDescription: { type: String, required: true },
    applicationTypes:{ type: [String], default: ["Frontend", "Backend"], required: true }, // List of application types (e.g., Frontend, Backend, Mobile)
    createdBy: { type: String, required: true }, // You could store the user ID here if needed
    generatedRequirements: { type: String, required: true }, // Final updated requirements
    modules: { type: [String], default: [] }, // List of suggested modules (optional)

    // --- NEW FIELDS FOR FILE TREE AND CODE GENERATION ---
    files: [FileSchema], // Array of file objects using the FileSchema
    projectTreeText: { type: String, default: '' }, // A human-readable representation of the entire project structure
    // --- END NEW FIELDS ---

}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Create a model based on the schema
const Project = mongoose.model("Project", ProjectSchema);

export default Project;