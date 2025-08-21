// controllers/aiModelController.js
import AIModel from '../models/aiModel.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// The ENCRYPTION_KEY should be a 32-byte (256-bit) key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 

// Make sure the key is correctly set and has the right length.
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.error("Critical Error: ENCRYPTION_KEY is not defined or is not 32 bytes.");
  // In a production environment, you would exit the process here
  // process.exit(1);
}

// Function to encrypt the apiKey
const encrypt = (text) => {
  // Generate a random 16-byte (128-bit) Initialization Vector
  const iv = crypto.randomBytes(16); 
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // Return the IV and the encrypted data, so you can decrypt it later
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Function to decrypt the apiKey
export const decrypt = (encryptedText) => {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encrypted = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Function to create a new AI model
export const createAIModel = async (req, res) => {
  try {
    // Encrypt the API key before saving
    const encryptedApiKey = encrypt(req.body.apiKey);
    const newModel = new AIModel({
      ...req.body,
      apiKey: encryptedApiKey,
    });
    await newModel.save();
    res.status(201).json({
      message: 'AI model created successfully!',
      model: newModel
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating AI model',
      error: error.message
    });
  }
};

// Function to get all AI models
export const getAllAIModels = async (req, res) => {
  try {
    const models = await AIModel.find();
    // Decrypt the API key for each model before sending the response
    const decryptedModels = models.map(model => ({
      ...model._doc,
      apiKey: decrypt(model.apiKey)
    }));
    res.status(200).json(decryptedModels);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching AI models',
      error: error.message
    });
  }
};

// Function to get a single AI model by ID
export const getAIModelById = async (req, res) => {
  try {
    const model = await AIModel.findById(req.params.id);
    if (!model) {
      return res.status(404).json({
        message: 'AI model not found'
      });
    }
    // Decrypt the API key before sending the response
    const decryptedModel = {
      ...model._doc,
      apiKey: decrypt(model.apiKey)
    };
    res.status(200).json(decryptedModel);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching AI model',
      error: error.message
    });
  }
};

// Function to update an AI model
export const updateAIModel = async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Encrypt the new API key if it's included in the request
    if (updateData.apiKey) {
      updateData.apiKey = encrypt(updateData.apiKey);
    }
    
    const model = await AIModel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!model) {
      return res.status(404).json({
        message: 'AI model not found'
      });
    }
    // Decrypt the API key before sending the response
    const decryptedModel = {
      ...model._doc,
      apiKey: decrypt(model.apiKey)
    };
    res.status(200).json({
      message: 'AI model updated successfully!',
      model: decryptedModel
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating AI model',
      error: error.message
    });
  }
};

// Function to delete an AI model
export const deleteAIModel = async (req, res) => {
  try {
    const model = await AIModel.findByIdAndDelete(req.params.id);
    if (!model) {
      return res.status(404).json({
        message: 'AI model not found'
      });
    }
    res.status(200).json({
      message: 'AI model deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting AI model',
      error: error.message
    });
  }
};

// Function to seed the database with initial data
export const seedAIModels = async (req, res) => {
  try {
    const modelsToSeed = [{
      "name": "GPT-4",
      "modelId": "gpt-4",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": encrypt("YOUR_OPENAI_API_KEY_HERE"),
      "provider": "openai",
      "description": "Advanced language model for text generation and analysis",
      "type": "text",
      "features": ["Chat", "Completion", "Edit", "Analysis"],
      "pricing": "Pay per token",
      "icon": "MessageSquare"
    }, {
      "name": "Claude 3 Sonnet",
      "modelId": "claude-3-sonnet-20240229",
      "baseUrl": "https://api.anthropic.com/v1",
      "apiKey": encrypt("YOUR_ANTHROPIC_API_KEY_HERE"),
      "provider": "anthropic",
      "description": "Powerful language model with enhanced reasoning capabilities",
      "type": "text",
      "features": ["Chat", "Analysis", "Code", "Math"],
      "pricing": "Pay per token",
      "icon": "Brain"
    }, {
      "name": "DALL-E 3",
      "modelId": "dall-e-3",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": encrypt("YOUR_OPENAI_API_KEY_HERE"),
      "provider": "openai",
      "description": "Create realistic images and art from text descriptions",
      "type": "image",
      "features": ["Generation", "Edit", "Variation"],
      "pricing": "Per image",
      "icon": "Image"
    }, {
      "name": "Stable Diffusion XL",
      "modelId": "stable-diffusion-xl-1024-v1-0",
      "baseUrl": "https://api.stability.ai/v1",
      "apiKey": encrypt("YOUR_STABILITYAI_API_KEY_HERE"),
      "provider": "stability-ai",
      "description": "Open-source image generation with high quality results",
      "type": "image",
      "features": ["Generation", "Inpainting", "Outpainting"],
      "pricing": "Self-hosted",
      "icon": "Image"
    }, {
      "name": "CodeLlama",
      "modelId": "codellama-7b-instruct",
      "baseUrl": "https://api.replicate.com/v1", // Example base URL for a hosted version
      "apiKey": encrypt("YOUR_REPLICATE_API_KEY_HERE"),
      "provider": "meta",
      "description": "Specialized model for code generation and analysis",
      "type": "code",
      "features": ["Generation", "Explanation", "Debug"],
      "pricing": "Open source",
      "icon": "FileCode"
    }, {
      "name": "Whisper",
      "modelId": "whisper-1",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": encrypt("YOUR_OPENAI_API_KEY_HERE"),
      "provider": "openai",
      "description": "Speech recognition and translation model",
      "type": "audio",
      "features": ["Transcription", "Translation"],
      "pricing": "Pay per minute",
      "icon": "Music"
    }, {
      "name": "Stable Video",
      "modelId": "stable-video-diffusion",
      "baseUrl": "https://api.stability.ai/v1",
      "apiKey": encrypt("YOUR_STABILITYAI_API_KEY_HERE"),
      "provider": "stability-ai",
      "description": "Generate and edit videos using AI",
      "type": "video",
      "features": ["Generation", "Edit"],
      "pricing": "Pay per video",
      "icon": "Video"
    }];

    await AIModel.deleteMany({});
    const result = await AIModel.insertMany(modelsToSeed);
    res.status(201).json({
      message: 'Database seeded successfully!',
      count: result.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error seeding database',
      error: error.message
    });
  }
};
