// routes/headersRoutes.js

import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getHeadersPolicy, upsertHeadersPolicy } from "../controllers/headersController.js";

const router = Router();
router.get("/", protect, getHeadersPolicy);     // ?planId=...
router.post("/", protect, upsertHeadersPolicy); // upsert

export default router;
