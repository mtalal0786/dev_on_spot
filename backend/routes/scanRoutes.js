// routes/scanRoutes.js
import express from 'express';
const router = express.Router();
import { initiateScan, getScanStatus } from '../controllers/scanController.js';

router.route('/').post(initiateScan);
router.route('/:scanId').get(getScanStatus);

export default router;