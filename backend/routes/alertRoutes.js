import { Router } from "express";
import { list } from "../controllers/alertController.js";

const router = Router();
router.get("/", list);

export default router;
