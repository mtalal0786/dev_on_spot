import { Router } from "express";
import { summary, upsert } from "../controllers/quotaController.js";

const router = Router();
router.get("/", summary);
router.put("/:key", upsert); // optional admin endpoint

export default router;
