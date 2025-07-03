import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { getRequirementPrompt } from '../../../../lib/RequirementPrompts';  // Importing from lib/prompts.ts

// POST request handler for generating requirements
export async function POST(req: Request) {
  try {
    const { requirements } = await req.json();  // Get user input from the request body

    // Check if the requirements are provided
    if (!requirements) {
      return NextResponse.json({ error: "No requirements provided" }, { status: 400 });
    }

    // Ensure the API key is defined
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set in environment variables" }, { status: 500 });
    }

    // Initialize the Google Gemini API client
    const ai = new GoogleGenAI({
      apiKey,  // Use the API key from environment variables
    });

    // Get the prompt with enhanced content for SRS generation
    const systemPrompt = getRequirementPrompt();  // Getting the system prompt for SRS generation

    // Call the API to generate content without thinkingConfig
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",  // Updated model to "gemini-2.0-flash"
      contents: `${systemPrompt}\n\nUser Requirements:\n${requirements}`,  // Use backticks for proper string interpolation
    });

    // Check if the response was successful
    if (!response || !response.text) {
      console.error('API Response Error:', response);
      return NextResponse.json({ error: "Failed to generate requirements" }, { status: 500 });
    }

    // Return the generated content as JSON
    return NextResponse.json({
      generatedRequirements: response.text,  // Send the markdown formatted text back to the frontend
    });

  } catch (error) {
    console.error("Error generating requirements:", error);
    return NextResponse.json({ error: "Failed to generate requirements" }, { status: 500 });
  }
}
