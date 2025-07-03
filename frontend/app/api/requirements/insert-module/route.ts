import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getInsertModulePrompt } from "../../../../lib/RequirementPrompts"; // Importing from lib/SuggestedReqPrompts.ts

// POST request handler for inserting the clicked module into the requirements
export async function POST(req: Request) {
  try {
    const { requirements, moduleName } = await req.json(); // Get the current generated requirements and clicked module

    // Check if the requirements and moduleName are provided
    if (!requirements || !moduleName) {
      return NextResponse.json(
        { error: "Requirements or module name not provided" },
        { status: 400 }
      );
    }

    // Ensure the API key is defined
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in environment variables" },
        { status: 500 }
      );
    }

    // Initialize the Google Gemini API client
    const ai = new GoogleGenAI({
      apiKey, // Use the API key from environment variables
    });

    // Get the prompt for inserting the module based on the generated requirements and the module name
    const systemPrompt = getInsertModulePrompt(); // Getting the prompt for module insertion

    // Call the Gemini API to insert the module in the appropriate place
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Using the "gemini-2.0-flash" model
      contents: `${systemPrompt.replace("{generatedRequirements}", requirements).replace("{moduleName}", moduleName)}`, // Inject requirements and moduleName into the prompt
    });

    // Check if the response was successful
    if (!response || !response.text) {
      console.error("API Response Error:", response);
      return NextResponse.json(
        { error: "Failed to fetch updated requirements" },
        { status: 500 }
      );
    }
    console.log("Updated Requirements:", response.text); // Log the updated requirements for debugging

    // Return the updated requirements with the new module inserted
    return NextResponse.json({
      updatedRequirements: response.text, // Return the updated document
    });
  } catch (error) {
    console.error("Error inserting module:", error);
    return NextResponse.json(
      { error: "Failed to insert the module" },
      { status: 500 }
    );
  }
}
