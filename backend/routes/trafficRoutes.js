import express from 'express';
const router = express.Router();
import { getProjects, getTrafficLogs, generateTraffic, getTrafficChartData } from '../controllers/trafficController.js';

router.get('/projects', getProjects);
router.get('/logs', getTrafficLogs);
router.post('/generate', generateTraffic);
router.get('/chart', getTrafficChartData);

export default router;