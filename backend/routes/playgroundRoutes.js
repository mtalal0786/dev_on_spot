import express from 'express';
import { handlePlaygroundRequest } from '../controllers/playgroundController.js';

// Create an Express Router instance
const router = express.Router();

/**
 * @route POST /
 * @desc Handles dynamic requests to the AI playground
 * @access Public
 */
router.post('/', handlePlaygroundRequest);

export default router;
