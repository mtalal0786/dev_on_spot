

import { execa } from 'execa'; // Import execa for non-interactive command execution
import { GoogleGenerativeAI } from "@google/generative-ai"; // Correct import
import { getAppGenerationPrompt } from "../lib/Prompts.js";  // Import the system prompt for Gemini
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
dotenv.config();


console.log("=== API Key Debug ===");
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
console.log("GEMINI_API_KEY first 10 chars:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) : 'undefined');
console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('GEMINI')));
console.log("===================");


// Initialize Gemini API client with the API key (using the correct constructor)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the directory name equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set a timeout duration (in milliseconds)
const TIMEOUT_DURATION = 300000; // 5 minute timeout

export const generateNextAppFiles = async (req, res) => {
  const { projectName, requirements } = req.body; // Destructure projectName and requirements from request body

  // Step 1: Check if projectName and requirements are provided
  if (!requirements || !projectName) {
    return res.status(400).json({ error: "Project name or requirements missing" });
  }

  // Sanitize project name for npm (lowercase, no spaces, no special chars)
  const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  console.log("Sanitized project name: ", safeProjectName, "Requirements: ", requirements); // Log the sanitized project name for debugging

  // Step 2: Dynamically create the parent folder with the sanitized project name
  const projectPath = path.join(__dirname, "../../projects", safeProjectName); // Use safeProjectName here

  // Log the generated path for debugging
  console.log("Generated project path: ", projectPath);

  // Create the parent folder if it doesn't exist
  try {
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true }); // Recursively create the folder
    }
  } catch (err) {
    console.error("Error creating project folder:", err);
    return res.status(500).json({ error: "Failed to create project folder" });
  }

  // Step 3: Run `npx create-next-app` to generate the Next.js app inside the folder
  try {
    // Fix the create-next-app command - remove conflicting flags
    const command = `npx create-next-app@latest . --typescript --eslint --tailwind --src-dir --app --import-alias "@/*" --yes`;

    // Step 4: Run the `npx` command using execa
    const { stdout, stderr } = await execa('npx', [
      'create-next-app@latest', 
      '.', 
      '--typescript', 
      '--eslint', 
      '--tailwind', 
      '--src-dir', 
      '--app', 
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
      return res.status(500).json({ error: "Failed to create Next.js app" });
    }

    console.log("Next.js app created:", stdout);

    // Step 5: Generate the system prompt for Gemini based on the requirements and project name
    const systemPrompt = getAppGenerationPrompt(requirements, safeProjectName);  // Pass the projectName and requirements into the prompt

    // Step 6: Call Gemini to modify the generated Next.js app based on the system prompt
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      `System prompt: ${systemPrompt}`,
      `Project name: ${safeProjectName}`,
      `Requirements: ${requirements}`,
      `Please generate a JSON structure for the Next.js app files and folders based on these requirements.`
    ]);

    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      return res.status(500).json({ error: "Failed to modify app with Gemini" });
    }

    // Step 7: Parse the response from Gemini to get the folder and file structure
    let generatedAppStructure;
    try {
      // Try to extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
let jsonString = jsonMatch ? jsonMatch[1] : responseText;

// Replace backtick-quoted "content" fields with proper JSON-safe double quotes
jsonString = jsonString.replace(/"content":\s*`([\s\S]*?)`/g, (_, content) => {
  const safeContent = JSON.stringify(content); // Converts to valid string with escapes
  return `"content": ${safeContent}`;
});

try {
  generatedAppStructure = JSON.parse(jsonString);
} catch (parseErr) {
  console.error("Error parsing Gemini response:", parseErr);
  console.error("Sanitized JSON:", jsonString);
  return res.status(500).json({ error: "Invalid response format from Gemini" });
}

    } catch (parseErr) {
      console.error("Error parsing Gemini response:", parseErr);
      console.error("Response text:", responseText);
      return res.status(500).json({ error: "Invalid response format from Gemini" });
    }

    // Step 8: Create the files and folders dynamically based on the generated structure
    const createFilesAndFolders = (structure, basePath) => {
      structure.forEach(item => {
        const currentPath = path.join(basePath, item.name);

        if (item.type === 'folder') {
          if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath, { recursive: true }); // Create folder recursively
            console.log(`Created folder: ${currentPath}`);
          }
          // Recursively create files/folders inside this folder
          if (item.children) {
            createFilesAndFolders(item.children, currentPath);
          }
        } else if (item.type === 'file') {
          if (!fs.existsSync(currentPath)) {
            fs.writeFileSync(currentPath, item.content || '');
            console.log(`Created file: ${currentPath}`);
          }
        }
      });
    };

    // Step 9: Call the function to create the files and folders based on the Gemini structure
    if (generatedAppStructure && generatedAppStructure.root) {
      createFilesAndFolders(generatedAppStructure.root, projectPath);
    }

    // Step 10: Run the tree command to get the project structure excluding node_modules and .next
    const getProjectTree = async (projectPath) => {
      try {
        // Use a cross-platform approach for listing directories
        const listFiles = (dir, prefix = '') => {
          const items = fs.readdirSync(dir);
          let tree = '';
          
          items.forEach((item, index) => {
            if (item === 'node_modules' || item === '.next' || item === '.git') return;
            
            const itemPath = path.join(dir, item);
            const isLast = index === items.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            
            tree += `${prefix}${connector}${item}\n`;
            
            if (fs.statSync(itemPath).isDirectory()) {
              const extension = isLast ? '    ' : '│   ';
              tree += listFiles(itemPath, prefix + extension);
            }
          });
          
          return tree;
        };
        
        return listFiles(projectPath);
      } catch (error) {
        console.error("Error generating project tree:", error);
        return null;
      }
    };

    // Step 11: Generate the tree of the project excluding unwanted folders
    const projectTree = await getProjectTree(projectPath);
    console.log("Generated project tree: ", projectTree);

    // Step 12: Return the generated app structure and the success response
    res.json({
      generatedAppStructure, // Send the generated app structure as the response
      projectTree, // Include the project tree
      message: "App files and folder structure generated successfully",
    });
  } catch (error) {
    console.error("Error creating and modifying Next.js app:", error);
    return res.status(500).json({ error: "Failed to create and modify Next.js app" });
  }
};