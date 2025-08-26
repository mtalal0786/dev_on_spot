import Template from '../models/Template.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to safely delete files
const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
    } catch (err) {
        if (err.code !== 'ENOENT') { // Ignore "file not found" errors
            console.error(`Failed to delete file ${filePath}: ${err.message}`);
        }
    }
};

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

        // Increment usedCount before sending the response
        template.usedCount = (template.usedCount || 0) + 1;
        await template.save();

        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createTemplate = async (req, res) => {
    try {
        const { title, description, category, creator } = req.body;
        
        if (!req.files || !req.files.thumbnails || !req.files.templateZip) {
            return res.status(400).json({ message: 'At least one image and a template zip file are required' });
        }

        const templateZipFile = req.files.templateZip[0];
        
        // Map all uploaded image files to their URLs
        const image_urls = req.files.thumbnails.map(file => `/thumbnails/${file.filename}`);
        const file_url = `/templates/${templateZipFile.filename}`;

        const template = new Template({ 
            title, 
            description, 
            category, 
            image_urls, // Save array of all image URLs
            file_url,
            creator,
        });

        const createdTemplate = await template.save();
        res.status(201).json(createdTemplate);
    } catch (error) {
        res.status(400).json({ message: 'Invalid template data', error: error.message });
    }
};

export const updateTemplate = async (req, res) => {
    try {
        const { title, description, category, creator } = req.body;
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        
        // Update text fields
        template.title = title || template.title;
        template.description = description || template.description;
        template.category = category || template.category;
        template.creator = creator || template.creator;

        // Handle new thumbnails upload
        if (req.files && req.files.thumbnails) {
            // Delete all old image files from the disk
            if (template.image_urls && template.image_urls.length > 0) {
                for (const imageUrl of template.image_urls) {
                    const oldImagePath = path.join(__dirname, '..', '..', imageUrl);
                    await deleteFile(oldImagePath);
                }
            }
            
            // Set new image URLs
            template.image_urls = req.files.thumbnails.map(file => `/thumbnails/${file.filename}`);
        }

        // Handle new zip file upload
        if (req.files && req.files.templateZip) {
            if (template.file_url) {
                const oldFilePath = path.join(__dirname, '..', '..', template.file_url);
                await deleteFile(oldFilePath);
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
        
        // Collect all file paths to be deleted
        const filesToDelete = [
            template.file_url,
            ...(template.image_urls || [])
        ].filter(url => url);
        
        // Delete files from the disk
        for (const fileUrl of filesToDelete) {
            const filePath = path.join(__dirname, '..', '..', fileUrl);
            await deleteFile(filePath);
        }
        
        // Now delete the database entry
        await Template.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Template removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const downloadTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findById(id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const filePath = path.join(__dirname, '..', '..', template.file_url);

        res.download(filePath, (err) => {
            if (err) {
                console.error('Download error:', err);
                return res.status(500).json({ message: 'File download failed', error: err.message });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};