// toolController.js

import Tool from '../models/toolsSchema.js';

/**
 * @desc    Create a new tool
 * @route   POST /api/tools
 * @access  Public (for now)
 */
export const createTool = async (req, res) => {
  try {
    const { name, description, category, icon_url, api_endpoint, status, associated_model_ids } = req.body;

    if (!name || !description || !category || !api_endpoint) {
      return res.status(400).json({ message: 'Please provide all required fields: name, description, category, and api_endpoint.' });
    }

    const newTool = await Tool.create({
      name,
      description,
      category,
      icon_url,
      api_endpoint,
      status,
      associated_model_ids,
    });

    res.status(201).json({
      message: 'Tool created successfully!',
      tool: newTool,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A tool with this name already exists. Please use a different name.' });
    }
    res.status(500).json({ message: 'Server error while creating the tool.', error: error.message });
  }
};

/**
 * @desc    Get all tools
 * @route   GET /api/tools
 * @access  Public
 */
export const getTools = async (req, res) => {
  try {
    const tools = await Tool.find();
    res.status(200).json(tools);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching tools.', error: error.message });
  }
};

/**
 * @desc    Get a single tool by ID
 * @route   GET /api/tools/:id
 * @access  Public
 */
export const getToolById = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found.' });
    }
    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching the tool.', error: error.message });
  }
};

/**
 * @desc    Update a tool by ID
 * @route   PUT /api/tools/:id
 * @access  Public
 */
export const updateTool = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTool = await Tool.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!updatedTool) {
      return res.status(404).json({ message: 'Tool not found.' });
    }

    res.status(200).json({
      message: 'Tool updated successfully!',
      tool: updatedTool,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A tool with this name already exists. Please use a different name.' });
    }
    res.status(500).json({ message: 'Server error while updating the tool.', error: error.message });
  }
};

/**
 * @desc    Delete a tool by ID
 * @route   DELETE /api/tools/:id
 * @access  Public
 */
export const deleteTool = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTool = await Tool.findByIdAndDelete(id);

    if (!deletedTool) {
      return res.status(404).json({ message: 'Tool not found.' });
    }

    res.status(200).json({
      message: 'Tool deleted successfully!',
      tool: deletedTool,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting the tool.', error: error.message });
  }
};
