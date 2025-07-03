// // controllers/geminiController.js
// import { GoogleGenAI } from '@google/genai'; // Gemini AI client
// import { getSuggestedModulePrompt } from "../../lib/RequirementPrompts"; // Assuming you have predefined prompts

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// // Get suggested modules based on the generated requirements
// export const getSuggestedModules = async (req, res) => {
//   try {
//     const { requirements } = req.body;

//     // Send the requirements to Gemini for module suggestions
//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash",
//       contents: `${getSuggestedModulePrompt()}\n\nGenerated Requirements:\n${requirements}`,
//     });

//     if (!response || !response.text) {
//       return res.status(500).json({ error: "Failed to fetch suggested modules" });
//     }

//     // Parse and clean the response
//     const suggestedModules = response.text
//       .split("\n")
//       .map(line => line.trim())
//       .filter(module => module && !module.includes("###") && !module.includes("Analysis:"))
//       .map(module => module.replace(/[^a-zA-Z0-9 ]/g, "").trim());

//     res.json({ suggestedModules: suggestedModules.slice(0, 15) }); // Limit to first 15 modules
//   } catch (error) {
//     console.error("Error fetching suggested modules:", error);
//     res.status(500).json({ error: "Failed to fetch suggested modules" });
//   }
// };
