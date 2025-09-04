import express from "express";
import { getTransactions, confirmPaymentNoWebhook } from "../controllers/transactionsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Role-aware list (Admin sees all; User sees own)
router.get("/", protect, getTransactions);

// Finalize purchase from success page (no webhook)
router.post("/confirm", confirmPaymentNoWebhook);

export default router;
