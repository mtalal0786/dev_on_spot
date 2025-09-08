import { Router } from "express";
import { list, getById, create, update, remove, action } from "../controllers/instanceController.js";

const router = Router();

// List all instances
router.get("/", list);

// Get single instance by ID
router.get("/:id", getById);

// Create a new instance
router.post("/", create);

// Update instance
router.put("/:id", update);

// Delete instance
router.delete("/:id", remove);

// Instance actions (start/stop/reboot)
router.post("/:id/actions", action);

export default router;
