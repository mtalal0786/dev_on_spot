// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        return res.status(401).json({ error: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      // This catch block handles both JWT verification failures and database errors
      console.error(error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    // If the Authorization header is not present or doesn't start with 'Bearer'
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

// Middleware to authorize specific roles (checks if the user has a required role)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the authorized roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role '${req.user.role}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

// Middleware to verify the password reset token
export const verifyResetToken = (req, res, next) => {
  const { resetToken } = req.body;

  if (!resetToken) {
    return res.status(400).json({ error: "Reset token is required" });
  }

  try {
    // Verify the reset token using the same secret
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    req.user = decoded; // Store the user ID for subsequent processing
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired reset token" });
  }
};

