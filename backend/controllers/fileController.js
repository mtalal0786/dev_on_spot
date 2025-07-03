// controllers/fileController.js
import fs from 'fs-extra'; // For file system operations
import path from 'path';   // For handling paths

// Function to create frontend files inside the generated project
export const createFrontendFile = async (project, fileName, content) => {
  try {
    const projectFolderPath = path.join(__dirname, '..', 'generated_projects', project.projectName, 'frontend');
    const filePath = path.join(projectFolderPath, fileName);

    // Write the content into the file
    await fs.outputFile(filePath, content);
    console.log(`Frontend file created: ${filePath}`);
  } catch (error) {
    console.error("Error creating frontend file:", error);
  }
};

// Function to create backend files inside the generated project
export const createBackendFile = async (project, fileName, content) => {
  try {
    const projectFolderPath = path.join(__dirname, '..', 'generated_projects', project.projectName, 'backend');
    const filePath = path.join(projectFolderPath, fileName);

    // Write the content into the file
    await fs.outputFile(filePath, content);
    console.log(`Backend file created: ${filePath}`);
  } catch (error) {
    console.error("Error creating backend file:", error);
  }
};
