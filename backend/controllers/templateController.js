// controllers/templateController.js
import Template from '../models/Template.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({});
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!req.files || !req.files.thumbnail || !req.files.templateZip) {
      return res.status(400).json({ message: 'Thumbnail and template zip files are required' });
    }

    const thumbnailFile = req.files.thumbnail[0];
    const templateZipFile = req.files.templateZip[0];

    const thumbnail_url = `/thumbnails/${thumbnailFile.filename}`;
    const file_url = `/templates/${templateZipFile.filename}`;

    const template = new Template({ 
      title, 
      description, 
      category, 
      thumbnail_url, 
      file_url 
    });

    const createdTemplate = await template.save();
    res.status(201).json(createdTemplate);
  } catch (error) {
    res.status(400).json({ message: 'Invalid template data', error: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Update text fields
    template.title = title || template.title;
    template.description = description || template.description;
    template.category = category || template.category;

    // Handle new thumbnail upload: delete old file and save new one
    if (req.files && req.files.thumbnail) {
      if (template.thumbnail_url) {
        const oldThumbnailPath = path.join(__dirname, '..', '..', template.thumbnail_url);
        await fs.unlink(oldThumbnailPath).catch(err => console.error(`Failed to delete old thumbnail: ${err.message}`));
      }
      template.thumbnail_url = `/thumbnails/${req.files.thumbnail[0].filename}`;
    }

    // Handle new zip file upload: delete old file and save new one
    if (req.files && req.files.templateZip) {
      if (template.file_url) {
        const oldFilePath = path.join(__dirname, '..', '..', template.file_url);
        await fs.unlink(oldFilePath).catch(err => console.error(`Failed to delete old zip file: ${err.message}`));
      }
      template.file_url = `/templates/${req.files.templateZip[0].filename}`;
    }
    
    const updatedTemplate = await template.save();
    res.status(200).json(updatedTemplate);
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data', error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Delete files from the disk first
    const thumbnailPath = path.join(__dirname, '..', '..', template.thumbnail_url);
    const filePath = path.join(__dirname, '..', '..', template.file_url);
    
    await fs.unlink(thumbnailPath).catch(err => console.error(`Failed to delete thumbnail file: ${err.message}`));
    await fs.unlink(filePath).catch(err => console.error(`Failed to delete zip file: ${err.message}`));
    
    // Now delete the database entry
    await Template.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Template removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const downloadTemplate = async (req, res) => {
  try {
    const {id} = req.params;
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const filePath = path.join(__dirname, '..', '..', template.file_url);

    res.download(filePath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'File download failed', error: err.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};