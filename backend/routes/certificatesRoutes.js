import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { listCertificates } from "../controllers/certificatesController.js";

const router = Router();

// GET /api/certificates
router.get("/", protect, listCertificates);

export default router;
