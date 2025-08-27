import BlogPost from '../models/blogPost.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'; // Use the promises API for asynchronous file operations
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to safely delete files
const deleteFile = async (filePath) => {
  try {
    // Check if the file exists before trying to delete it
    await fs.stat(filePath);
    await fs.unlink(filePath);
    console.log(`Successfully deleted file: ${filePath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`File not found, skipping deletion: ${filePath}`);
    } else {
      console.error(`Failed to delete file ${filePath}: ${err.message}`);
    }
  }
};

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '..', '..', 'blog_images');

// Ensure the blog_images directory exists asynchronously
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// @desc    Get all blog posts with optional search functionality
// @route   GET /api/blogs
export const getBlogPosts = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    let query = {};

    if (searchTerm) {
      query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { excerpt: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        ],
      };
    }

    const blogPosts = await BlogPost.find(query).sort({ createdAt: -1 });
    res.status(200).json(blogPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new blog post
// @route   POST /api/blogs
export const createBlogPost = async (req, res) => {
  try {
    const { title, excerpt, content, tags, author } = req.body;
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = `/blog_images/${req.file.filename}`;
    const tagsArray = tags ? tags.split(',').map((tag) => tag.trim()) : [];
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const newBlogPost = new BlogPost({
      title,
      slug,
      excerpt,
      content,
      tags: tagsArray,
      image: imagePath,
      author: author || 'Current User',
    });

    const savedBlogPost = await newBlogPost.save();
    res.status(201).json(savedBlogPost);
  } catch (error) {
    if (req.file) {
      // Clean up the uploaded image on failure
      await deleteFile(req.file.path); 
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single blog post by ID
// @route   GET /api/blogs/:id
export const getBlogPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const blogPost = await BlogPost.findById(id);

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.status(200).json(blogPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a blog post by ID
// @route   PUT /api/blogs/:id
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, tags, author } = req.body;

    const updateData = {
      title,
      excerpt,
      content,
      author,
    };

    if (tags !== undefined) {
      updateData.tags = tags.split(',').map((tag) => tag.trim());
    }

    const blogPost = await BlogPost.findById(id);
    if (!blogPost) {
      if (req.file) {
        await deleteFile(req.file.path); // Clean up if blog post is not found
      }
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Handle new image upload
    if (req.file) {
      const oldImagePath = path.join(__dirname, '..', '..', blogPost.image);
      await deleteFile(oldImagePath); // Delete the old image from server
      updateData.image = `/blog_images/${req.file.filename}`; // New image path
    }

    const updatedBlogPost = await BlogPost.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedBlogPost);
  } catch (error) {
    if (req.file) {
      await deleteFile(req.file.path); // Clean up uploaded image on failure
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a blog post by ID
// @route   DELETE /api/blogs/:id
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const blogPost = await BlogPost.findById(id);

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Delete the image file from the server
    const imagePath = path.join(__dirname, '..', '..', blogPost.image);
    await deleteFile(imagePath);

    await BlogPost.findByIdAndDelete(id);

    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

