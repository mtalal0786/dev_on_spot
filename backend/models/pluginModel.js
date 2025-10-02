// models/plugin.model.js
import mongoose from 'mongoose';

const pluginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  downloads: {
    type: String,
    default: '0',
  },
  status: {
    type: String,
    enum: ['installed', 'available'],
    default: 'available',
  },
  version: {
    type: String,
    default: '1.0.0',
  },
}, {
  timestamps: true,
});

const Plugin = mongoose.model('Plugin', pluginSchema);

export default Plugin;