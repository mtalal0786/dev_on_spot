// controllers/aiModelController.js
import AIModel from '../models/aiModel.js';

// Function to create a new AI model
export const createAIModel = async (req, res) => {
  try {
    const newModel = new AIModel(req.body);
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
    res.status(200).json(models);
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
    res.status(200).json(model);
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
    const model = await AIModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!model) {
      return res.status(404).json({
        message: 'AI model not found'
      });
    }
    res.status(200).json({
      message: 'AI model updated successfully!',
      model
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
      "provider": "OpenAI",
      "description": "Advanced language model for text generation and analysis",
      "type": "text",
      "features": ["Chat", "Completion", "Edit", "Analysis"],
      "pricing": "Pay per token",
      "icon": "MessageSquare"
    }, {
      "name": "Claude 2",
      "provider": "Anthropic",
      "description": "Powerful language model with enhanced reasoning capabilities",
      "type": "text",
      "features": ["Chat", "Analysis", "Code", "Math"],
      "pricing": "Pay per token",
      "icon": "Brain"
    }, {
      "name": "DALL-E 3",
      "provider": "OpenAI",
      "description": "Create realistic images and art from text descriptions",
      "type": "image",
      "features": ["Generation", "Edit", "Variation"],
      "pricing": "Per image",
      "icon": "Image"
    }, {
      "name": "Stable Diffusion XL",
      "provider": "Stability AI",
      "description": "Open-source image generation with high quality results",
      "type": "image",
      "features": ["Generation", "Inpainting", "Outpainting"],
      "pricing": "Self-hosted",
      "icon": "Image"
    }, {
      "name": "CodeLlama",
      "provider": "Meta",
      "description": "Specialized model for code generation and analysis",
      "type": "code",
      "features": ["Generation", "Explanation", "Debug"],
      "pricing": "Open source",
      "icon": "FileCode"
    }, {
      "name": "Whisper",
      "provider": "OpenAI",
      "description": "Speech recognition and translation model",
      "type": "audio",
      "features": ["Transcription", "Translation"],
      "pricing": "Pay per minute",
      "icon": "Music"
    }, {
      "name": "Stable Video",
      "provider": "Stability AI",
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