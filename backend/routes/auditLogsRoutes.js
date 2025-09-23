import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { listAuditLogs } from "../controllers/auditLogsController.js";

const router = Router();
router.get("/", protect, listAuditLogs); // ?q=&page=&pageSize=
export default router;
