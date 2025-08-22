// models/toolsSchema.js

import mongoose from 'mongoose'; // Use ES6 import syntax

// Function to generate a URL-friendly slug from a string
const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-')          // Replace multiple - with single -
    .replace(/^-+/, '')            // Trim - from start of text
    .replace(/-+$/, '');           // Trim - from end of text
};

// Define the Mongoose Schema for a Tool
const toolSchema = new mongoose.Schema({
  // The unique name of the tool, e.g., "Image Editor".
  // It's a required string and must be unique in the database.
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  
  // A URL-friendly slug generated from the tool's name.
  // This is useful for clean URLs (e.g., /tools/image-editor).
  slug: {
    type: String,
    unique: true,
  },

  // A brief description of the tool's purpose.
  // This is a required text area input.
  description: {
    type: String,
    required: true,
  },

  // The category the tool belongs to, from a predefined list.
  // The 'enum' validator ensures the value is one of the allowed strings.
  category: {
    type: String,
    required: true,
    enum: ['Design', 'Video & Audio', 'Communication', 'Development', 'Analytics', 'Other'],
  },

  // The URL or path to the tool's icon for the UI.
  icon_url: {
    type: String,
    default: null,
  },

  // The API endpoint that the tool interacts with.
  // This is a critical, required field for a functional tool.
  api_endpoint: {
    type: String,
    required: true,
  },

  // The current status of the tool, for visibility and management.
  // 'active' tools are displayed, while others might be hidden.
  status: {
    type: String,
    required: true,
    enum: ['active', 'maintenance', 'deprecated'],
    default: 'active',
  },

  // An array of IDs of other models associated with this tool.
  // In a real application, this would be an array of mongoose.Schema.Types.ObjectId.
  // We'll use a string array for simplicity.
  associated_model_ids: {
    type: [String],
    default: [],
  },
}, {
  // Mongoose will automatically add 'createdAt' and 'updatedAt' fields to the schema.
  // This is a best practice for tracking when documents are created and last modified.
  timestamps: true,
});

// A pre-save hook to automatically generate the slug before saving the document.
toolSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

// Create and export the Mongoose model for the 'tools' collection.
const Tool = mongoose.model('Tool', toolSchema);

export default Tool; // Use ES6 export syntax
