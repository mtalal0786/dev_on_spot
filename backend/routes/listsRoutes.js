import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { listLists, createList, updateList, deleteList } from "../controllers/listsController.js";

const router = Router();
router.get("/", protect, listLists);
router.post("/", protect, createList);
router.put("/:id", protect, updateList);
router.delete("/:id", protect, deleteList);

export default router;
