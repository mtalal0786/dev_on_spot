import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getSuggestedModulePrompt } from "../../../../lib/RequirementPrompts"; // Importing from lib/SuggestedReqPrompts.ts

// POST request handler for fetching suggested modules
export async function POST(req: Request) {
  try {
    const { requirements } = await req.json(); // Get generated content (requirements) from the request body

    // Check if the requirements are provided
    if (!requirements) {
      return NextResponse.json(
        { error: "No requirements provided" },
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

    // Get the prompt for generating suggested modules based on the generated requirements
    const systemPrompt = getSuggestedModulePrompt(); // Getting the system prompt for suggested modules

    // Call the Gemini API to get suggested modules based on the generated content
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Using the "gemini-2.0-flash" model
      contents: `${systemPrompt}\n\nGenerated Requirements:\n${requirements}`, // Pass generated requirements as input
    });

    // Check if the response was successful
    if (!response || !response.text) {
      return NextResponse.json(
        { error: "Failed to fetch suggested modules" },
        { status: 500 }
      );
    }

    // Clean and process the response to get a proper array of module names
    const suggestedModules = response.text
      .split("\n") // Split the response into individual lines
      .map((line) => line.trim()) // Remove any extra spaces or unwanted characters
      .filter((module) => module && !module.includes("###") && !module.includes("Analysis:") && module !== ",") // Filter out unwanted lines, commas, and explanations
      .map((module) => module.replace(/[^a-zA-Z0-9 ]/g, '').trim()); // Remove any special characters

    // Limit to a maximum of 15 modules
    const finalModules = suggestedModules.slice(1, 16); // Return only the first 15 modules

    // Return the array of module names
    return NextResponse.json({
      suggestedModules: finalModules, // Return 15 modules
    });
  } catch (error) {
    console.error("Error fetching suggested modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggested modules" },
      { status: 500 }
    );
  }
}
