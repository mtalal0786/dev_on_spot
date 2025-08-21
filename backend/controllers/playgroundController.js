import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import mongoose from 'mongoose';
import AIModel from '../models/aiModel.js';
import { decrypt } from './aiModelController.js'; // Import the decrypt function

/**
 * Maps model providers to their SDK client constructors.
 * This allows for dynamic client initialization with API keys from the database.
 */
const clientConstructors = {
    google: GoogleGenerativeAI,
    openai: OpenAI,
    anthropic: Anthropic
};

/**
 * Handles all AI playground requests dynamically based on the model selected.
 *
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 */
export const handlePlaygroundRequest = async (req, res) => {
    const { modelName, prompt, temperature, max_tokens } = req.body;

    if (!modelName || !prompt) {
        return res.status(400).json({ error: "Model name and prompt are required." });
    }

    try {
        // Find the model configuration in the database
        const modelConfig = await AIModel.findOne({ name: modelName });

        if (!modelConfig) {
            return res.status(404).json({ error: `Model '${modelName}' not found.` });
        }

        // DECRYPT THE API KEY BEFORE USE
        const apiKey = decrypt(modelConfig.apiKey);
        const provider = modelConfig.provider;
        const modelId = modelConfig.modelId;

        // Dynamically create the SDK client using the retrieved API key
        let client;
        if (provider === 'openai') {
            client = new clientConstructors[provider]({ apiKey });
        } else if (provider === 'google') {
            client = new clientConstructors[provider](apiKey);
        } else if (provider === 'anthropic') {
            client = new clientConstructors[provider]({ apiKey });
        } else {
            return res.status(400).json({ error: "No handler for this model provider." });
        }

        let responseText = "";

        // Use a switch statement on the provider to handle different SDK call signatures
        switch (provider) {
            case "google":
                const geminiModel = client.getGenerativeModel({ model: modelId });
                const geminiResult = await geminiModel.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { temperature: temperature || 0.7 }
                });
                responseText = geminiResult.response.text();
                break;

            case "openai":
                const openaiCompletion = await client.chat.completions.create({
                    model: modelId,
                    messages: [{ role: "user", content: prompt }],
                    temperature: temperature || 0.7,
                    max_tokens: max_tokens || 1000
                });
                responseText = openaiCompletion.choices[0].message.content;
                break;

            case "anthropic":
                const anthropicCompletion = await client.messages.create({
                    model: modelId,
                    max_tokens: max_tokens || 1000,
                    messages: [{ role: "user", content: prompt }],
                    temperature: temperature || 0.7
                });
                responseText = anthropicCompletion.content[0].text;
                break;

            default:
                return res.status(400).json({ error: "No handler for this model provider." });
        }

        res.status(200).json({ output: responseText });

    } catch (error) {
        console.error("API call failed:", error);
        res.status(500).json({ error: "Failed to get a response from the model.", details: error.message });
    }
};
