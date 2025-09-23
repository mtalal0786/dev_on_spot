import { Router } from 'express';
import { simulateRequest } from '../controllers/simulateController.js';
import { protect } from '../middlewares/authMiddleware.js';

const r = Router();
r.post('/', protect, simulateRequest);
export default r;
