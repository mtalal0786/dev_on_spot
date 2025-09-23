import { asyncHandler } from "../lib/asyncHandler.js";
import RateLimitPolicy from "../models/RateLimitPolicy.js";
import AuditLog from "../models/AuditLog.js";

export const getRateLimit = asyncHandler(async (req, res) => {
  const { planId } = req.query;
  if (!planId) return res.status(400).json({ message: "planId is required" });
  const doc = await RateLimitPolicy.findOne({ planId });
  res.json(doc || null);
});

export const upsertRateLimit = asyncHandler(async (req, res) => {
  const { planId, globalLimit, perIpLimit, loginLimit, action, duration } = req.body;
  
  // Validate that globalLimit and perIpLimit are objects (if they exist)
  if (globalLimit && typeof globalLimit !== "object") {
    return res.status(400).json({ message: "globalLimit must be an object" });
  }

  if (perIpLimit && typeof perIpLimit !== "object") {
    return res.status(400).json({ message: "perIpLimit must be an object" });
  }

  const updated = await RateLimitPolicy.findOneAndUpdate(
    { planId },
    { $set: { globalLimit, perIpLimit, loginLimit, action, duration } },
    { new: true, upsert: true }
  );

  await AuditLog.create({
    action: "UPSERT_RATE_LIMIT",
    resource: `RateLimitPolicy:${updated._id}`,
    changes: JSON.stringify(req.body),
    user: req.user?.email || "system",
    ip: req.ip,
  });

  res.json(updated);
});
