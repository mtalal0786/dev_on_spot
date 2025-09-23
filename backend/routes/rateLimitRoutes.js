import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getRateLimit, upsertRateLimit } from "../controllers/rateLimitController.js";

const router = Router();
router.get("/", protect, getRateLimit);     // ?planId=...
router.post("/", protect, upsertRateLimit); // upsert

export default router;
