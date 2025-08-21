// models/aiModel.js
import mongoose from 'mongoose';

const aiModelSchema = new mongoose.Schema({
  // The user-friendly name of the model (e.g., "Gemini Pro").
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // The provider of the model (e.g., "google", "openai", "anthropic").
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  // The technical ID of the model for API calls (e.g., "gemini-pro").
  modelId: {
    type: String,
    required: true,
    trim: true,
  },
  // The base URL for the model's API endpoint.
  baseUrl: {
    type: String,
    required: true,
    trim: true,
  },
  // The API key for the model.
  // NOTE: You must implement AES 256 encryption before saving this field
  // and decryption when retrieving it for security.
  apiKey: {
    type: String,
    required: true,
  },
  // A brief description of the model.
  description: {
    type: String,
    required: true,
  },
  // The type of the model's primary output.
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'code', 'audio', 'video'],
  },
  // Key features or capabilities of the model.
  features: {
    type: [String],
    default: [],
  },
  // Pricing information for the model.
  pricing: {
    type: String,
    required: true,
  },
  // URL or path to an icon representing the model.
  icon: {
    type: String,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const AIModel = mongoose.model('AIModel', aiModelSchema);
export default AIModel;
