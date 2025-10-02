// routes/plugin.routes.js
import express from 'express';
import { getAllPlugins, getPluginById, createPlugin, updatePlugin, deletePlugin } from '../controllers/pluginController.js';

const router = express.Router();

// Read all plugins
router.get('/', getAllPlugins);

// Read one plugin by ID
router.get('/:id', getPluginById);

// Create a new plugin
router.post('/', createPlugin);

// Update a plugin by ID
router.put('/:id', updatePlugin);

// Delete a plugin by ID
router.delete('/:id', deletePlugin);

export default router;