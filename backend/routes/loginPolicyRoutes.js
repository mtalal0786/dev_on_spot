import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getLoginPolicy, upsertLoginPolicy } from "../controllers/loginPolicyController.js";

const router = Router();
router.get("/", protect, getLoginPolicy);     // ?planId=...
router.post("/", protect, upsertLoginPolicy); // upsert

export default router;
