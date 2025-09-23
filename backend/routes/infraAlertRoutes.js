import { Router } from "express";
import { list } from "../controllers/infraAlertController.js";

const router = Router();
// /api/infrastructure/alerts
router.get("/", list);

export default router;
