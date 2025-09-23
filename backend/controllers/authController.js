// backend/controllers/authController.js
import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const generateToken = (id, role) =>
  jwt.sign({ userId: id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });

/* =========================
 * Auth (public)
 * ========================= */
export const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match" });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    const token = generateToken(newUser._id, newUser.role);
    res.status(201).json({
      message: "User created successfully",
      token,
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Mark last login for KPI
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================
 * Password reset
 * ========================= */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1h
    await user.save();

    // 👉 Send token & email in the reset URL
    const resetUrl = `http://localhost:3000/reset-password.html?token=${resetToken}&email=${encodeURIComponent(
      email
    )}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: `"DevOnSpot Alerts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <div style="background: #0066cc; color: #fff; padding: 20px; text-align: center;">
      <h2 style="margin: 0;">🔐 Password Reset Request</h2>
    </div>

    <!-- Body -->
    <div style="padding: 20px; color: #333; line-height: 1.6;">
      <p>Hello,</p>
      <p>We received a request to reset the password for your account. If this was you, please click the button below to choose a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #0066cc; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
          Reset Your Password
        </a>
      </div>
      
      <p>This password reset link will expire in <strong>1 hour</strong>.</p>
      <p>If you did not request a password reset, please ignore this email. Your account will remain secure.</p>
      
      <p style="margin-top: 30px;">Thank you,<br>The DevOnSpot Security Team</p>
    </div>

    <!-- Footer -->
    <div style="background: #f8f8f8; padding: 15px; font-size: 12px; color: #777; text-align: center;">
      <p style="margin: 0;">This is an automated message. Please do not reply.</p>
      <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} DevOnSpot. All rights reserved.</p>
    </div>
  </div>
`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Error sending email" });
      }
      res.status(200).json({ message: "Password reset email sent successfully." });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    user.password = newPassword; // pre-save hook should hash
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully. Please login with your new password." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


/* =========================
 * Users CRUD (protected)
 * ========================= */
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role = "User" } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email, password are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const validRoles = User.schema.path("role").enumValues;
    if (!validRoles.includes(role))
      return res.status(400).json({ error: "Invalid role specified." });

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({
      message: "User created",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (email && email !== user.email) {
      const dupe = await User.findOne({ email });
      if (dupe) return res.status(400).json({ error: "Email already in use" });
      user.email = email;
    }
    if (name) user.name = name;

    if (role) {
      const validRoles = User.schema.path("role").enumValues;
      if (!validRoles.includes(role))
        return res.status(400).json({ error: "Invalid role specified." });
      user.role = role;
    }
    if (password) user.password = password; // pre-save hook will hash

    await user.save();
    res.status(200).json({
      message: "User updated",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const validRoles = User.schema.path("role").enumValues;
    if (!validRoles.includes(role))
      return res.status(400).json({ error: "Invalid role specified." });

    user.role = role;
    await user.save();
    res.status(200).json({ message: "User role updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const me = (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authorized" });
  const u = req.user;
  res.json({
    user: {
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isEmailVerified: u.isEmailVerified,
    },
  });
};

/* =========================
 * KPIs (protected)
 * ========================= */
export const getUserKpis = async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersLast30 = await User.countDocuments({ createdAt: { $gte: since } });
    const activeUsersLast30 = await User.countDocuments({ lastLoginAt: { $gte: since } });

    res.status(200).json({ totalUsers, newUsersLast30, activeUsersLast30 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
