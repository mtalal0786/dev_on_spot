import express from "express";
import {
  listPackages,
  getPackageByIdController,   // <-- add this import
  createPackage,
  updatePackage,
  deletePackage
} from "../controllers/packagesController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", listPackages);
router.get("/:id", getPackageByIdController); // <-- add this line

// Admin
router.post("/",   protect, authorizeRoles("Admin"), createPackage);
router.put("/:id", protect, authorizeRoles("Admin"), updatePackage);
router.delete("/:id", protect, authorizeRoles("Admin"), deletePackage);

export default router;
