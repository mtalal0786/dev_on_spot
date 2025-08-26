import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Template title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Template category is required'],
    trim: true,
  },
  // New field to store all image URLs
  image_urls: {
    type: [String], 
    default: [],
  },
  file_url: {
    type: String,
    trim: true,
  },
  creator: {
    type: String,
    trim: true,
    default: 'Team',
  },
  usedCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Template = mongoose.model('Template', templateSchema);
export default Template;