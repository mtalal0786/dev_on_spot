
// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// Middleware to verify the standard JWT for authentication
const authMiddleware = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    // Verify the regular JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

// Middleware to verify the password reset token
const verifyResetToken = (req, res, next) => {
  const { resetToken } = req.body;

  if (!resetToken) {
    return res.status(400).json({ error: "Reset token is required" });
  }

  try {
    // Verify the reset token using a different secret or shorter expiry time
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    req.user = decoded.userId; // Store the user ID (or other info) for subsequent processing
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired reset token" });
  }
};

export { authMiddleware, verifyResetToken };
