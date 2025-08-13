import express from 'express';
import { checkDomainAvailability, registerDomain } from '../controllers/domainController.js'; // Adjust path as needed

const router = express.Router();

router.get('/check-availability', checkDomainAvailability);
router.post('/register', registerDomain); // New registration route

export default router;