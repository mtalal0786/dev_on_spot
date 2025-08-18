// models/Template.js
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
  thumbnail_url: {
    type: String,
    trim: true,
  },
  file_url: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const Template = mongoose.model('Template', templateSchema);
export default Template;