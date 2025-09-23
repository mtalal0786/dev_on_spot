import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { listAutomations, createAutomation, updateAutomation, deleteAutomation } from "../controllers/automationsController.js";

const router = Router();
router.get("/", protect, listAutomations);
router.post("/", protect, createAutomation);
router.put("/:id", protect, updateAutomation);
router.delete("/:id", protect, deleteAutomation);

export default router;
