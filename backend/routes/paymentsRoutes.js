import express from "express";
import { createCheckoutSession, getCheckoutSession } from "../controllers/paymentsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auth required
router.post("/checkout/session", protect, createCheckoutSession);
router.get("/checkout/session",  protect, getCheckoutSession);

export default router;
