import { Router } from 'express';
import { listFirewalls } from '../controllers/firewallsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const r = Router();

// Route to fetch all firewalls with pagination and filters
r.get('/', protect, listFirewalls);

export default r;
