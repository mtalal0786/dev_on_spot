// models/aiModel.js
import mongoose from 'mongoose';

const aiModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'code', 'audio', 'video'],
  },
  features: {
    type: [String],
    default: [],
  },
  pricing: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
});

const AIModel = mongoose.model('AIModel', aiModelSchema);
export default AIModel;