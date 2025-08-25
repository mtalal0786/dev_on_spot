// domainRoutes.js
import express from "express";
import {
  checkDomainAvailability,
  registerDomain,
  createDomain,
  getAllDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
} from "../controllers/domainController.js";

const router = express.Router();

router.get("/check-availability", checkDomainAvailability);
router.post("/register", registerDomain);
router.post("/", createDomain);
router.get("/", getAllDomains);
router.get("/:id", getDomainById);
router.put("/:id", updateDomain);
router.delete("/:id", deleteDomain);
export default router;
