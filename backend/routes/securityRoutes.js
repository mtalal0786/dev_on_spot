import { Router } from 'express';
import { getOverview, getEmailAlertsPref, setEmailAlertsPref } from '../controllers/securityController.js';
import { protect } from '../middlewares/authMiddleware.js';

const r = Router();
r.get('/overview', protect, getOverview);
r.get('/email-alerts', protect, getEmailAlertsPref);
r.post('/email-alerts', protect, setEmailAlertsPref);
export default r;
