// controllers/requirementsController.js
import { GoogleGenAI } from "@google/genai";
import { getSuggestedModulePrompt, getInsertModulePrompt, getRequirementPrompt } from "../lib/Prompts.js";  // Import prompts for Gemini

import dotenv from 'dotenv';
dotenv.config();


// Initialize Google Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST request handler for fetching suggested modules
export const getSuggestedModules = async (req, res) => {
  try {
    const { requirements } = req.body;  // Extract the generated requirements from the request body

    if (!requirements) {
      return res.status(400).json({ error: "No requirements provided" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${getSuggestedModulePrompt()}\n\nGenerated Requirements:\n${requirements}`,
    });

    if (!response || !response.text) {
      return res.status(500).json({ error: "Failed to fetch suggested modules" });
    }

    // Clean and process the response
    const suggestedModules = response.text
      .split("\n")
      .map((line) => line.trim())
      .filter((module) => module && !module.includes("###") && !module.includes("Analysis:"))
      .map((module) => module.replace(/[^a-zA-Z0-9 ]/g, "").trim());

    res.json({ suggestedModules: suggestedModules.slice(0, 15) }); // Return first 15 modules
  } catch (error) {
    console.error("Error fetching suggested modules:", error);
    return res.status(500).json({ error: "Failed to fetch suggested modules" });
  }
};

// POST request handler for inserting a clicked module into the requirements
export const insertModule = async (req, res) => {
  try {
    const { requirements, moduleName } = req.body;

    if (!requirements || !moduleName) {
      return res.status(400).json({ error: "Requirements or module name not provided" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${getInsertModulePrompt().replace("{generatedRequirements}", requirements).replace("{moduleName}", moduleName)}`,
    });

    if (!response || !response.text) {
      return res.status(500).json({ error: "Failed to insert module into requirements" });
    }

    return res.json({ updatedRequirements: response.text });
  } catch (error) {
    console.error("Error inserting module:", error);
    return res.status(500).json({ error: "Failed to insert the module" });
  }
};

// POST request handler for generating requirements based on user input
export const generateRequirements = async (req, res) => {
  try {
    // --- START MODIFICATION ---
    // Destructure the new fields from the request body
    const { projectName, projectDescription, applications } = req.body;

    // Validate required fields
    if (!projectName || !projectDescription || !applications || !Array.isArray(applications) || applications.length === 0) {
      return res.status(400).json({ error: "Missing or invalid project details (projectName, projectDescription, applications)." });
    }

    // Construct a more comprehensive prompt using all provided details
    const promptText = `Generate detailed System Requirements Specification (SRS) for a project with the following details:

Requirement Generation Prompt:${getRequirementPrompt()}
Project Name: ${projectName}
Project Description: ${projectDescription}
Application Types: ${applications.join(', ')}

Please provide a comprehensive list of functional and non-functional requirements, covering aspects like user management, data storage, UI/UX, security, performance, and scalability relevant to the specified application types. Structure the response clearly, perhaps with headings for different categories of requirements.`;

    // --- END MODIFICATION ---

    // Assuming 'ai' is your initialized Gemini AI client
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      // Use the newly constructed promptText directly
      contents: [{ role: "user", parts: [{ text: promptText }] }],
    });

    // Check for valid response structure
    if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts || response.candidates[0].content.parts.length === 0) {
      console.error("Gemini API response structure unexpected:", response);
      return res.status(500).json({ error: "Failed to generate requirements: Unexpected AI response format." });
    }

    const generatedText = response.candidates[0].content.parts[0].text;

    return res.json({ generatedRequirements: generatedText });
  } catch (error) {
    console.error("Error generating requirements:", error);
    // Provide a more generic error message to the client for security
    return res.status(500).json({ error: "Failed to generate requirements due to an internal server error." });
  }
};
