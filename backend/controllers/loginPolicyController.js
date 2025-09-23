import { asyncHandler } from "../lib/asyncHandler.js";
import LoginPolicy from "../models/LoginPolicy.js";
import AuditLog from "../models/AuditLog.js";

export const getLoginPolicy = asyncHandler(async (req, res) => {
  const { planId } = req.query;
  if (!planId) return res.status(400).json({ message: "planId is required" });
  const doc = await LoginPolicy.findOne({ planId });
  res.json(doc || null);
});

export const upsertLoginPolicy = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  if (!planId) return res.status(400).json({ message: "planId is required" });

  const updated = await LoginPolicy.findOneAndUpdate(
    { planId },
    { $set: req.body },
    { new: true, upsert: true }
  );

  await AuditLog.create({ action: "UPSERT_LOGIN_POLICY", resource: `LoginPolicy:${updated._id}`, changes: JSON.stringify(req.body), user: req.user?.email || "system", ip: req.ip });
  res.json(updated);
});
