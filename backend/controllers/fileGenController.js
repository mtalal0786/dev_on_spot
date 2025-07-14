// controllers/fileGenController.js
import { execa } from 'execa';
import { GoogleGenerativeAI } from "@google/generative-ai"; // Corrected import for the official package name
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Project from '../models/projectSchema.js';

dotenv.config();

// Debugging for API Key
console.log("=== API Key Debug ===");
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
console.log("GEMINI_API_KEY first 10 chars:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) : 'undefined');
console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('GEMINI')));
console.log("===================");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using gemini-2.0-flash as per your preference

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMEOUT_DURATION = 300000; // 5 minute timeout for execa commands

// --- Helper Functions ---

/**
 * Deduce programming language from file extension.
 * @param {string} ext - The file extension (e.g., 'js', 'tsx', 'css').
 * @returns {string} The corresponding language string.
 */
const getLanguageFromExtension = (ext) => {
    switch (ext.toLowerCase()) {
        case 'js':
        case 'jsx': return 'javascript';
        case 'ts':
        case 'tsx': return 'typescript';
        case 'css': return 'css';
        case 'html': return 'html';
        case 'json': return 'json';
        case 'md':
        case 'mdx': return 'markdown';
        case 'py': return 'python';
        case 'java': return 'java';
        case 'c': return 'c';
        case 'cpp': return 'cpp';
        case 'cs': return 'csharp';
        case 'go': return 'go';
        case 'php': return 'php';
        case 'rb': return 'ruby';
        case 'rs': return 'rust';
        case 'xml': return 'xml';
        case 'yml':
        case 'yaml': return 'yaml';
        case 'sql': return 'sql';
        case 'sh': return 'shell';
        case 'toml': return 'toml';
        default: return 'plaintext';
    }
};

/**
 * Recursively reads files and their content from a directory.
 * Excludes common build/dependency folders and hidden files/folders.
 * @param {string} dir - The current directory to scan.
 * @param {string} rootDir - The root directory of the project for relative paths.
 * @returns {Array<Object>} An array of file objects, each with filePath, fileName, fileExtension, fileLanguage, fileContent.
 */
const getFilesRecursively = (dir, rootDir) => {
    let files = [];
    let items;
    try {
        items = fs.readdirSync(dir, { withFileTypes: true });
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
        return [];
    }

    for (const item of items) {
        const itemPath = path.join(dir, item.name);
        const relativePath = path.relative(rootDir, itemPath).replace(/\\/g, '/');

        // Exclude common build/dependency folders and hidden files/folders
        if (item.isDirectory() && (item.name === 'node_modules' || item.name === '.next' || item.name === '.git' || item.name === '.vscode' || item.name.startsWith('.'))) {
            continue;
        }
        if (item.isFile() && item.name.startsWith('.')) { // Exclude hidden files like .env, .gitignore etc.
            continue;
        }
        // Exclude common lock/config files that are usually very large or not meant for AI generation
        if (item.isFile() && (item.name === 'package-lock.json' || item.name === 'yarn.lock' || item.name === 'pnpm-lock.yaml')) {
            continue;
        }


        if (item.isDirectory()) {
            files = files.concat(getFilesRecursively(itemPath, rootDir));
        } else if (item.isFile()) {
            const fileExtension = path.extname(item.name).slice(1);
            const fileLanguage = getLanguageFromExtension(fileExtension);
            let fileContent = '';
            try {
                // Read file content only if it's a text-based file
                if (fileLanguage !== 'plaintext' || ['json', 'md', 'xml', 'yml', 'yaml', 'toml'].includes(fileExtension.toLowerCase())) {
                    fileContent = fs.readFileSync(itemPath, 'utf8');
                } else {
                    // For truly binary or unknown files, don't read content to avoid errors
                    fileContent = `// Content not read for binary/unknown file type: ${item.name}`;
                }
            } catch (readErr) {
                console.warn(`Could not read file content for ${itemPath}:`, readErr.message);
                fileContent = `// Error reading file content: ${readErr.message}`;
            }

            files.push({
                filePath: relativePath,
                fileName: item.name,
                fileExtension: fileExtension,
                fileLanguage: fileLanguage,
                fileContent: fileContent
            });
        }
    }
    return files;
};

/**
 * Converts a flat list of file objects into a human-readable tree string.
 * This is used to provide context to Gemini about the project structure.
 * @param {Array<Object>} files - Array of file objects.
 * @returns {string} A string representation of the file tree.
 */
function buildTreeStringFromFiles(files) {
    if (!files || files.length === 0) {
        return "No files generated yet.";
    }

    const uniquePaths = new Set();
    files.forEach(file => {
        let currentPath = '';
        file.filePath.split('/').forEach(part => {
            if (part) {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                uniquePaths.add(currentPath);
            }
        });
    });

    const sortedPaths = Array.from(uniquePaths).sort((a, b) => {
        const aParts = a.split('/');
        const bParts = b.split('/');
        const minLen = Math.min(aParts.length, bParts.length);

        for (let i = 0; i < minLen; i++) {
            if (aParts[i] !== bParts[i]) {
                const aIsFile = aParts[i].includes('.');
                const bIsFile = bParts[i].includes('.');
                if (aIsFile !== bIsFile) {
                    return aIsFile ? 1 : -1;
                }
                return aParts[i].localeCompare(bParts[i]);
            }
        }
        return aParts.length - bParts.length;
    });

    let treeString = '';
    const printTree = (level, currentPath, remainingPaths) => {
        const children = remainingPaths.filter(p => {
            const parts = p.split('/');
            return parts.length === level + 1 && parts.slice(0, level).join('/') === currentPath;
        });

        children.sort((a, b) => {
            const aIsDirectory = !a.includes('.');
            const bIsDirectory = !b.includes('.');
            if (aIsDirectory && !bIsDirectory) return -1;
            if (!aIsDirectory && bIsDirectory) return 1;
            return a.localeCompare(b);
        });

        children.forEach((childPath, index) => {
            const isLast = index === children.length - 1;
            // Fix for RangeError: Invalid count value in String.repeat
            const indentation = level > 0 ? '    '.repeat(level - 1) : '';
            const connector = level > 0 ? (isLast ? '└── ' : '├── ') : '';

            const itemName = childPath.split('/').pop();
            const isDirectory = !itemName.includes('.');

            treeString += `${indentation}${connector}${itemName}${isDirectory ? '/' : ''}\n`;

            if (isDirectory) {
                printTree(level + 1, childPath, remainingPaths);
            }
        });
    };

    // Initial call for top-level items
    printTree(0, '', sortedPaths);

    // Fallback to simple list if complex tree fails or for flat structures
    if (treeString.trim() === '' || treeString.trim() === '/') {
        return files.map(file => file.filePath).sort().join('\n');
    }
    return treeString;
}

/**
 * Applies changes (creating folders/files, writing content) based on Gemini's JSON output.
 * @param {Array<Object>} structure - An array of file/folder objects from Gemini.
 * @param {string} basePath - The root directory where changes should be applied.
 */
const applyChangesToFilesAndFolders = (structure, basePath) => {
    structure.forEach(item => {
        const targetPath = path.join(basePath, item.path);

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
            if (item.children && Array.isArray(item.children)) {
                applyChangesToFilesAndFolders(item.children, basePath);
            }
        } else if (item.type === 'file') {
            fs.writeFileSync(targetPath, item.content || '');
            console.log(`Created/Updated file: ${targetPath}`);
        }
    });
};

/**
 * Internal helper function to get the complete code for a single file from Gemini.
 * It expects Gemini to return raw code, not JSON.
 * @param {Object} project - The Mongoose Project document.
 * @param {string} projectPath - The absolute path to the project directory on disk.
 * @param {Object} fileToRefine - The file object from project.files array to be refined.
 * @param {string} overallRequirements - The project's overall requirements.
 * @param {string} currentProjectTree - The human-readable tree string of the project.
 * @param {Array<Object>} allCurrentFiles - All current files of the project (for context).
 * @returns {Promise<string|null>} The generated raw code for the file, or null if failed/empty.
 */
const getFileContentFromGemini = async (project, projectPath, fileToRefine, overallRequirements, currentProjectTree, allCurrentFiles) => {
    // Filter relevant existing files for context to avoid sending too much data to Gemini
    // Focus on files in the same directory, common components, and global styles/layout
    const relevantExistingFiles = allCurrentFiles.filter(f =>
        f.filePath !== fileToRefine.filePath && // Exclude the file currently being processed
        (f.filePath.startsWith(path.dirname(fileToRefine.filePath) + '/') || // Files in the same or sub-directories
         f.filePath.includes('src/components') || // Common components
         f.filePath.includes('src/utils') ||     // Utilities
         f.filePath.includes('src/types') ||     // Type definitions/interfaces
         f.filePath.includes('src/app/layout.tsx') || // Main layout file
         f.filePath.includes('src/app/globals.css')) // Global styles
    ).map(f => `
File: ${f.filePath}
\`\`\`${f.fileLanguage}
${f.fileContent}
\`\`\`
`).join('\n') || 'No additional relevant existing files provided for context.';

    const geminiPrompt = `
You are an expert Next.js developer assistant, specializing in creating and completing code for files.
Your task is to provide the *complete and correct code* for the specific file described below, based on the overall project requirements and the context of other relevant files.

Overall Project Requirements:
\`\`\`
${overallRequirements}
\`\`\`

Current Project File Structure:
\`\`\`
${currentProjectTree}
\`\`\`

Existing Relevant Files (content provided for context, to help with imports, types, and consistency; ONLY use this for reference, do not modify these):
${relevantExistingFiles}

---
**Generate the COMPLETE content for this specific file:**
File Path: ${fileToRefine.filePath}
File Name: ${fileToRefine.fileName}
File Type/Language: ${fileToRefine.fileLanguage}

Current content of this file (if it exists, it might be empty or a placeholder from previous steps. You must provide the complete new content, not just changes):
\`\`\`${fileToRefine.fileLanguage}
${fileToRefine.fileContent || '// File is currently empty or has placeholder content.'}
\`\`\`

Please provide the *complete, updated content* for the file "${fileToRefine.filePath}".
Ensure the code is correct, follows Next.js best practices, and integrates seamlessly with the overall project requirements and existing files.
Return *ONLY the raw code for the file*, nothing else. Do not wrap it in markdown code blocks (e.g., \`\`\`typescript) or any other formatting, just the plain code.
`;

    console.log(`Sending prompt to Gemini for content of: ${fileToRefine.filePath}`);
    try {
        const result = await model.generateContent(geminiPrompt);
        const response = await result.response;
        const responseText = response.text();

        if (!responseText || responseText.trim() === '') {
            console.warn(`Gemini returned empty content for ${fileToRefine.filePath}.`);
            return null;
        }
        return responseText.trim();
    } catch (apiError) {
        console.error(`Error generating content for ${fileToRefine.filePath}:`, apiError.message);
        return null;
    }
};


/**
 * Main controller function to generate a Next.js app, perform initial AI modifications,
 * and then refine file content iteratively.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const generateNextAppFiles = async (req, res) => {
    const { projectId } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: "Project ID is missing from the request body." });
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid Project ID format." });
    }

    let project;
    try {
        project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found in database for the provided ID." });
        }
    } catch (dbError) {
        console.error("Error fetching project from database:", dbError);
        return res.status(500).json({ error: "Failed to retrieve project details from the database." });
    }

    const projectName = project.projectName;
    const requirements = project.generatedRequirements;
    const projectDescription = project.projectDescription;
    const applicationTypes = project.applicationTypes;
    const modules = project.modules;

    const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const projectPath = path.join(__dirname, "../../projects", safeProjectName);

    try {
        // --- 1. Prepare Project Directory ---
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

        // --- 2. Create Base Next.js App ---
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

        if (stderr && !stdout.includes("Success!")) {
            console.error("Error creating Next.js app:", stderr);
            return res.status(500).json({ error: "Failed to create Next.js app: " + stderr });
        }
        console.log("Next.js app created successfully.");

        // --- 3. Get Initial Project Files and Save to DB (First Pass) ---
        // This captures the 'create-next-app' output (boilerplate files)
        let currentFilesOnDisk = getFilesRecursively(projectPath, projectPath);
        project.files = currentFilesOnDisk;
        project.projectTreeText = buildTreeStringFromFiles(currentFilesOnDisk);
        await project.save(); // Save initial structure to DB
        console.log("Initial Next.js app structure and content saved to DB.");


        // --- 4. Define Prompt for Gemini to Customize/Modify App (initial broad JSON generation) ---
        // This prompt guides Gemini to create the main project structure and placeholder files.
        const initialJsonGenPrompt = `
You are an expert Next.js developer assistant.
The user wants to customize a newly created Next.js application based on specific requirements.
Here are the project details and the current file and folder structure of the newly created Next.js application:

Project Name: ${projectName}
Project Description: ${projectDescription}
Application Types: ${applicationTypes.join(', ')}
Overall Project Requirements:
\`\`\`
${requirements}
\`\`\`
${modules && modules.length > 0 ? `Suggested Modules/Features: ${modules.join(', ')}\n` : ''}

Current Project File Structure (generated by create-next-app):
\`\`\`
${project.projectTreeText}
\`\`\`

Based on these requirements and the existing project structure, provide a JSON array representing *only* the new files/folders to create, or existing files to modify/update with placeholder content. The primary goal of this first AI pass is to lay out the main structure and create *all* necessary files, even if their content is initially minimal or placeholder. These files will be filled with detailed code in a subsequent step.

**IMPORTANT Next.js App Router Convention:**
- For routes (e.g., '/dashboard', '/login'), always create a **folder** with that name, and inside it, create a file like \`page.tsx\` (for UI pages) or \`route.ts\` (for API routes). Do NOT create files without extensions directly as route segments.

For each item, include:
- "type": "folder" or "file"
- "name": The name of the file or folder (e.g., "components", "Button.tsx")
- "path": The full path relative to the project root (e.g., "src/components", "src/app/dashboard/page.tsx").
- "children": (Optional, for folders) An array of child file/folder objects.
- "extension": (Required for files) The file extension (e.g., "tsx", "css", "js", "json").
- "language": (Required for files) The programming or markup language (e.g., "TypeScript", "JavaScript", "CSS", "HTML", "JSON", "Markdown").
- "content": (Required for files) The content of the file. For this initial pass, use placeholder comments like "// TODO: Implement this component" or a basic functional skeleton. Do NOT provide full, detailed code yet.

Do NOT include any existing files or folders that do not need to be modified or are not part of the core structure you are establishing.
If a file's content is to be changed, you MUST provide the full new content (even if it's placeholder).
Ensure the JSON is valid and only includes the root array. Use escaped newlines (\\n) and tabs (\\t) within the "content" string.

Example of desired output structure:
\`\`\`json
[
  {
    "type": "folder",
    "name": "components",
    "path": "src/components",
    "children": [
      {
        "type": "file",
        "name": "Header.tsx",
        "path": "src/components/Header.tsx",
        "extension": "tsx",
        "language": "TypeScript",
        "content": "// TODO: Implement Header component with navigation."
      }
    ]
  },
  {
    "type": "folder", // Example of a route folder
    "name": "login",
    "path": "src/app/login",
    "children": [
      {
        "type": "file",
        "name": "page.tsx",
        "path": "src/app/login/page.tsx",
        "extension": "tsx",
        "language": "TypeScript",
        "content": "// TODO: Implement login page."
      }
    ]
  },
  {
    "type": "file",
    "name": "page.tsx",
    "path": "src/app/page.tsx",
    "extension": "tsx",
    "language": "TypeScript",
    "content": "export default function Home() {\\n  return (\\n    <main>\\n      <h1>Welcome!</h1>\\n      {/* TODO: Add main page content. */}\\n    </main>\\n  );\\n}"
  }
]
\`\`\`
`;

        console.log("Sending initial broad modification prompt to Gemini for project structure and placeholders:", projectName);
        const result = await model.generateContent(initialJsonGenPrompt);
        const response = await result.response;
        const responseText = response.text();

        if (!responseText) {
            return res.status(500).json({ error: "Failed to get response from Gemini for initial app modification." });
        }

        let generatedChangesStructure;
        try {
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
            let jsonString = jsonMatch ? jsonMatch[1] : responseText;
            generatedChangesStructure = JSON.parse(jsonString);

        } catch (parseErr) {
            console.error("Error parsing Gemini response for initial structure:", parseErr);
            console.error("Response text (potentially problematic):", responseText);
            return res.status(500).json({ error: "Invalid JSON response format from Gemini for initial structure. Failed to parse." });
        }

        if (generatedChangesStructure && Array.isArray(generatedChangesStructure)) {
            applyChangesToFilesAndFolders(generatedChangesStructure, projectPath);
        } else {
            console.warn("Gemini response for initial structure did not contain a root array for changes. No initial files were modified beyond create-next-app.");
        }

        // Re-read files after initial structure generation to get the updated state
        // This is crucial for the next step (file-by-file refinement) to have accurate context.
        currentFilesOnDisk = getFilesRecursively(projectPath, projectPath);
        project.files = currentFilesOnDisk;
        project.projectTreeText = buildTreeStringFromFiles(currentFilesOnDisk);
        await project.save(); // Save updated structure to DB
        console.log("Initial Gemini modifications applied and project structure updated in DB.");


        // --- NEW STEP 5: Loop through files and get detailed content from Gemini ---
        console.log("Starting file-by-file content generation/refinement process...");
        let filesRefinedCount = 0;

        // Filter files that are likely to need full code content from Gemini.
        // This filter should be carefully chosen to target only relevant code files.
        const filesToRefine = currentFilesOnDisk.filter(file =>
            (file.fileLanguage === 'typescript' ||
             file.fileLanguage === 'javascript' ||
             file.fileLanguage === 'css' ||
             file.fileLanguage === 'html' ||
             file.fileLanguage === 'json') && // Include JSON for config files if needed
            !file.filePath.includes('node_modules') &&
            !file.filePath.includes('.next') &&
            !file.filePath.includes('.git') &&
            !file.filePath.includes('.env') &&
            !file.filePath.includes('public/') && // Exclude public assets
            !file.filePath.includes('package.json') && // Exclude package.json
            !file.filePath.includes('package-lock.json') && // Exclude package-lock.json
            !file.filePath.includes('tsconfig.json') && // Exclude tsconfig.json
            !file.filePath.includes('next.config.ts') && // Exclude next.config.ts
            !file.filePath.includes('postcss.config.mjs') && // Exclude postcss.config.mjs
            !file.filePath.includes('eslint.config.mjs') && // Exclude eslint.config.mjs
            !file.filePath.includes('next-env.d.ts') && // Exclude next-env.d.ts
            !file.filePath.includes('README.md') // Exclude README.md
            // You might want to refine this filter to target only files under 'src/' for example:
            // file.filePath.startsWith('src/')
        );

        for (const file of filesToRefine) {
            const newContent = await getFileContentFromGemini(
                project,
                projectPath,
                file,
                requirements, // Overall project requirements
                project.projectTreeText, // Current tree
                project.files // All current files for context (important for inter-file consistency)
            );

            if (newContent !== null) {
                const targetPath = path.join(projectPath, file.filePath);
                try {
                    fs.writeFileSync(targetPath, newContent);
                    console.log(`Successfully updated content for: ${file.filePath}`);
                    filesRefinedCount++;

                    // After updating a file, immediately update the 'project.files' in memory
                    // and save to DB. This ensures subsequent Gemini calls have the latest context.
                    currentFilesOnDisk = getFilesRecursively(projectPath, projectPath);
                    project.files = currentFilesOnDisk;
                    project.projectTreeText = buildTreeStringFromFiles(currentFilesOnDisk);
                    await project.save();
                } catch (writeError) {
                    console.error(`Failed to write updated content for ${file.filePath}:`, writeError.message);
                }
            }
        }
        console.log(`File-by-file content generation/refinement completed. Total files updated in this phase: ${filesRefinedCount}`);


        // --- FINAL Save (Ensures the very last state is persisted) ---
        // This save is important to capture any changes from the last file in the loop.
        currentFilesOnDisk = getFilesRecursively(projectPath, projectPath);
        project.files = currentFilesOnDisk;
        project.projectTreeText = buildTreeStringFromFiles(currentFilesOnDisk);
        await project.save();
        console.log("Final project structure and content confirmed and saved to DB.");


        // --- 6. Return Success Response ---
        res.json({
            message: `App files and folder structure generated, modified, and refined successfully. Total files in project: ${project.files.length}. Files fully refined by Gemini: ${filesRefinedCount}`,
            projectId: project._id,
            totalFilesGenerated: project.files.length,
        });

    } catch (error) {
        console.error("Critical error during Next.js app creation or modification:", error);
        if (error.stderr) console.error("Execa stderr:", error.stderr);
        if (error.message.includes("Invalid JSON response")) {
            return res.status(500).json({ error: "AI response error: " + error.message });
        }
        return res.status(500).json({ error: "Failed to create and modify Next.js app due to an unexpected internal error." });
    }
};