// controllers/fileGenController.js
import { execa } from 'execa';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // Import mongoose for ID validation
import Project from '../models/projectSchema.js'; // Corrected path/name based on your provided structure

dotenv.config();

console.log("=== API Key Debug ===");
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
console.log("GEMINI_API_KEY first 10 chars:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) : 'undefined');
console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('GEMINI')));
console.log("===================");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMEOUT_DURATION = 300000; // 5 minute timeout

// Helper function to generate project tree
const getProjectTree = (dir, prefix = '') => {
  let tree = '';
  try {
    const items = fs.readdirSync(dir);

    items.forEach((item, index) => {
      // Exclude common build/dependency folders
      if (item === 'node_modules' || item === '.next' || item === '.git' || item === '.vscode') return;

      const itemPath = path.join(dir, item);
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';

      tree += `${prefix}${connector}${item}\n`;

      if (fs.statSync(itemPath).isDirectory()) {
        const extension = isLast ? '    ' : '│   ';
        tree += getProjectTree(itemPath, prefix + extension);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return `Error generating tree for ${dir}`;
  }
  return tree;
};


export const generateNextAppFiles = async (req, res) => {
  // 1. Get the projectId from the request body
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: "Project ID is missing from the request body." });
  }

  // Validate projectId format
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: "Invalid Project ID format." });
  }

  let project;
  try {
    // 2. Fetch the project details from MongoDB using the ID
    project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found in database for the provided ID." });
    }
  } catch (dbError) {
    console.error("Error fetching project from database:", dbError);
    return res.status(500).json({ error: "Failed to retrieve project details from the database." });
  }

  // Now, use the data fetched from the database
  const projectName = project.projectName;
  // *** IMPORTANT CORRECTION HERE ***
  // Use 'generatedRequirements' as per your projectSchema.js
  const requirements = project.generatedRequirements;

  const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  console.log("Sanitized project name: ", safeProjectName, "Requirements: ", requirements);

  const projectPath = path.join(__dirname, "../../projects", safeProjectName);

  try {
    // Ensure the target directory is clean
    try {
      if (fs.existsSync(projectPath)) {
        console.log(`Removing existing project directory: ${projectPath}`);
        fs.rmSync(projectPath, { recursive: true, force: true });
      }
      console.log(`Creating new project directory: ${projectPath}`);
      fs.mkdirSync(projectPath, { recursive: true });
    } catch (err) {
      console.error("Error preparing project folder:", err);
      return res.status(500).json({ error: "Failed to prepare project folder" });
    }

    console.log(`Creating Next.js app in: ${projectPath}`);
    const { stdout, stderr } = await execa('npx', [
      'create-next-app@latest',
      '.', // Creates the app in the current directory (projectPath)
      '--typescript',
      '--eslint',
      '--tailwind',
      '--src-dir',
      '--app', // Uses the new App Router
      '--import-alias',
      '@/*',
      '--yes'
    ], {
      cwd: projectPath,
      timeout: TIMEOUT_DURATION,
      stdio: 'pipe'
    });

    if (stderr) {
      console.error("Error creating Next.js app:", stderr);
      // It's possible for create-next-app to output to stderr even on success (warnings)
      // You might want to check for specific error messages in stderr
      if (!stdout.includes("Success!")) { // Basic check to see if it implies success despite stderr
          return res.status(500).json({ error: "Failed to create Next.js app: " + stderr });
      }
    }
    console.log("Next.js app created successfully.");

    const initialProjectTree = getProjectTree(projectPath);
    console.log("Initial project tree for Gemini:\n", initialProjectTree);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Define the prompt for Gemini to understand the existing structure and generate changes
    const geminiPrompt = `
      You are an expert Next.js developer assistant.
      The user wants to customize a newly created Next.js application.
      Here are the existing files and folders in the Next.js application:
      \`\`\`
      ${initialProjectTree}
      \`\`\`

      The project name is "${safeProjectName}".
      The user's requirements for customization are: "${requirements}".

      Based on these requirements and the existing project structure, provide a JSON array representing *only* the new files/folders to create, or existing files to modify.

      For each item, include:
      - "type": "folder" or "file"
      - "name": The name of the file or folder (e.g., "components", "Button.tsx")
      - "path": The full path relative to the project root (e.g., "/src/components", "/src/app/page.tsx").
                For files, this is critical to determine if it's a new file or an existing one to modify.
                For folders, this helps determine where to create them.
      - "children": (Optional, for folders) An array of child file/folder objects.
      - "extension": (Required for files) The file extension (e.g., "tsx", "css", "js", "json").
      - "language": (Required for files) The programming or markup language (e.g., "TypeScript", "JavaScript", "CSS", "HTML", "JSON", "Markdown").
      - "content": (Required for files, if creating or modifying) The complete content of the file. If modifying an existing file, provide the full new content.

      Do NOT include any existing files or folders that do not need to be modified.
      If a file's content is to be changed, you MUST provide the entire new content.
      Ensure the JSON is valid and only includes the root array.
      Example of desired output structure for adding a new file and modifying an existing one:
      \`\`\`json
      [
        {
          "type": "folder",
          "name": "components",
          "path": "/src/components",
          "children": [
            {
              "type": "file",
              "name": "Button.tsx",
              "path": "/src/components/Button.tsx",
              "extension": "tsx",
              "language": "TypeScript",
              "content": "import React from 'react';\\n\\ninterface ButtonProps {\\n  children: React.ReactNode;\\n  onClick: () => void;\\n}\\n\\nconst Button: React.FC<ButtonProps> = ({ children, onClick }) => {\\n  return (\\n    <button onClick={onClick} className=\\"px-4 py-2 bg-blue-500 text-white rounded\\"\\n    >\\n      {children}\\n    </button>\\n  );\\n};\\n\\nexport default Button;"
            }
          ]
        },
        {
          "type": "file",
          "name": "page.tsx",
          "path": "/src/app/page.tsx",
          "extension": "tsx",
          "language": "TypeScript",
          "content": "export default function Home() {\\n  return (\\n    <main className=\\"flex min-h-screen flex-col items-center justify-between p-24\\">\\n      <h1>Welcome to Next.js with Gemini!</h1>\\n      {/* New content added here */}\\n    </main>\\n  );\\n}"
        }
      ]
      \`\`\`
    `;


    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      return res.status(500).json({ error: "Failed to get response from Gemini for app modification." });
    }

    let generatedChangesStructure;
    try {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      let jsonString = jsonMatch ? jsonMatch[1] : responseText;

      // Handle potential backticks within content strings by converting them to proper JSON string
      jsonString = jsonString.replace(/"content":\s*`([\s\S]*?)`/g, (_, content) => {
          const safeContent = JSON.stringify(content); // Converts to valid string with escapes
          return `"content": ${safeContent}`;
      });

      generatedChangesStructure = JSON.parse(jsonString);

    } catch (parseErr) {
      console.error("Error parsing Gemini response:", parseErr);
      console.error("Response text (potentially problematic):", responseText);
      return res.status(500).json({ error: "Invalid JSON response format from Gemini." });
    }

    // Step 8: Create/modify files and folders dynamically based on the generated changes structure
    const applyChangesToFilesAndFolders = (structure, basePath) => {
      structure.forEach(item => {
        // Use 'path' property if provided by Gemini, otherwise construct from 'name'
        const targetPath = item.path ? path.join(basePath, item.path) : path.join(basePath, item.name);
        
        // Ensure parent directories exist for the target path
        const parentDir = path.dirname(targetPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
          console.log(`Ensured parent folder exists: ${parentDir}`);
        }

        if (item.type === 'folder') {
          if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
            console.log(`Created new folder: ${targetPath}`);
          } else {
            console.log(`Folder already exists: ${targetPath}`);
          }
          if (item.children) {
            // For children of a folder, their paths should be relative to this folder.
            // If Gemini provides full 'path', then it's relative to basePath.
            // If it provides only 'name', it's relative to current folder.
            // The prompt asks for 'path' relative to project root, so keep basePath
            applyChangesToFilesAndFolders(item.children, basePath);
          }
        } else if (item.type === 'file') {
          // Always write the file content. If it exists, it gets updated; if not, it gets created.
          fs.writeFileSync(targetPath, item.content || '');
          console.log(`Created/Updated file: ${targetPath}`);
        }
      });
    };

    if (generatedChangesStructure && Array.isArray(generatedChangesStructure)) {
      applyChangesToFilesAndFolders(generatedChangesStructure, projectPath);
    } else {
      console.warn("Gemini response did not contain a root array for changes. No files were modified.");
    }

    // Step 10 & 11: Run the tree command again to get the FINAL project structure
    const finalProjectTree = getProjectTree(projectPath);
    console.log("Final project tree after Gemini modifications:\n", finalProjectTree);

    // Step 12: Return the success response
    res.json({
      geminiResponse: generatedChangesStructure, // Send Gemini's generated changes
      finalProjectTree: finalProjectTree, // Include the final project tree
      message: "App files and folder structure generated and modified successfully",
      projectId: project._id // Confirming the ID used
    });

  } catch (error) {
    console.error("Critical error during Next.js app creation or modification:", error);
    if (error.stderr) console.error("Execa stderr:", error.stderr);
    return res.status(500).json({ error: "Failed to create and modify Next.js app due to an unexpected error." });
  }
};