// backend/routes/authRoutes.js
import express from "express";
import {
  signup, login, forgotPassword, resetPassword,
  getAllUsers, getUserById, updateUserRole, deleteUser,
  adminCreateUser, adminUpdateUser, getUserKpis, me
} from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { check } from "express-validator";

const router = express.Router();

/* ===== Who am I (protected) ===== */
router.get("/me", protect, me);

/* ========== Public ========== */
router.post(
  "/signup",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("confirmPassword", "Confirm password is required").exists(),
  ],
  signup
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);

router.post("/forgot-password", [check("email", "Please include a valid email").isEmail()], forgotPassword);

router.post(
  "/reset-password",
  [
    check("token", "Reset token is required").exists(),
    check("newPassword", "New password must be at least 6 characters").isLength({ min: 6 }),
  ],
  resetPassword
);

/* ========== KPIs (Admin + Editor) ========== */
router.get("/users/kpis", protect, authorizeRoles("Admin", "Editor"), getUserKpis);

/* ========== Read (Admin + Editor) ========== */
router.get("/users", protect, authorizeRoles("Admin", "Editor"), getAllUsers);
router.get("/users/:id", protect, authorizeRoles("Admin", "Editor"), getUserById);

/* ========== Admin CRUD ========== */
router.post(
  "/users",
  protect,
  authorizeRoles("Admin"),
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("role").optional().isIn(["Admin", "Editor", "User"]).withMessage("Invalid role"),
  ],
  adminCreateUser
);

router.put(
  "/users/:id",
  protect,
  authorizeRoles("Admin"),
  [
    check("email").optional().isEmail().withMessage("Invalid email"),
    check("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    check("role").optional().isIn(["Admin", "Editor", "User"]).withMessage("Invalid role"),
  ],
  adminUpdateUser
);

router.put(
  "/users/:id/role",
  protect,
  authorizeRoles("Admin"),
  [check("role").isIn(["Admin", "Editor", "User"]).withMessage("Invalid role")],
  updateUserRole
);

router.delete("/users/:id", protect, authorizeRoles("Admin"), deleteUser);

export default router;
