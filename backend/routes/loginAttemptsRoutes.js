import { Router } from 'express';
import { listLoginAttempts } from '../controllers/loginAttemptsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/security/login-attempts → list login attempts with search, filter, pagination
router.get("/", protect, listLoginAttempts);

export default router;
