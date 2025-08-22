// toolsRoutes.js

import express from 'express';
const router = express.Router();

// Import the complete set of controller functions
import { 
  createTool, 
  getTools, 
  getToolById, 
  updateTool, 
  deleteTool 
} from '../controllers/toolsController.js'; 

/**
 * @desc    API routes for managing tools.
 * @route   /api/tools
 */

// POST /api/tools - Create a new tool
router.post('/', createTool);

// GET /api/tools - Get all tools
router.get('/', getTools);

// GET /api/tools/:id - Get a single tool by ID
router.get('/:id', getToolById);

// PUT /api/tools/:id - Update a tool by ID
router.put('/:id', updateTool);

// DELETE /api/tools/:id - Delete a tool by ID
router.delete('/:id', deleteTool);

export default router;
