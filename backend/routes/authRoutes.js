

import express from "express";
import { signup, login, forgotPassword, resetPassword } from "../controllers/authController.js";
import { check } from "express-validator"; // For validation

const router = express.Router();

// POST route to sign up a new user
router.post(
  "/signup",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required and should be at least 6 characters").isLength({ min: 6 }),
    check("confirmPassword", "Confirm password is required").exists(),
  ],
  signup
);

// POST route for user login
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);

// POST route for forgot password (send reset email)
router.post("/forgot-password", [check("email", "Please include a valid email").isEmail()], forgotPassword);

// PUT route to update password (reset password)
router.put("/reset-password", 
  [
    check("email", "Please include a valid email").isEmail(),
    check("newPassword", "New password is required and should be at least 6 characters").isLength({ min: 6 }),
  ],
  resetPassword);  // Use PUT method to update the password

export default router;
