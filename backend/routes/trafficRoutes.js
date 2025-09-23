import express from 'express';
const router = express.Router();
import { getProjects, getTrafficLogs, generateTraffic } from '../controllers/trafficController.js';

router.get('/projects', getProjects);
router.get('/logs', getTrafficLogs);
router.post('/generate', generateTraffic);

export default router;