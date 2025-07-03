// controllers/requirementsController.js
import { GoogleGenAI } from "@google/genai";
import { getSuggestedModulePrompt, getInsertModulePrompt, getRequirementPrompt } from "../../lib/RequirementPrompts";

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
    const { requirements } = req.body;

    if (!requirements) {
      return res.status(400).json({ error: "No requirements provided" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${getRequirementPrompt()}\n\nUser Requirements:\n${requirements}`,
    });

    if (!response || !response.text) {
      return res.status(500).json({ error: "Failed to generate requirements" });
    }

    return res.json({ generatedRequirements: response.text });
  } catch (error) {
    console.error("Error generating requirements:", error);
    return res.status(500).json({ error: "Failed to generate requirements" });
  }
};
