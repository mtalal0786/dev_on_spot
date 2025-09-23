import { Router } from "express";
import { listAlerts, createAlert } from "../controllers/securityAlertsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, listAlerts);       // GET /security/alerts
router.post("/", protect, createAlert);     // POST /security/alerts

export default router;
