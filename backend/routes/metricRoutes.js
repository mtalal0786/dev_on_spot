import { Router } from "express";
import { series } from "../controllers/metricsController.js";

const router = Router();
router.get("/", series);

export default router;
