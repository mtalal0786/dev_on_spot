import { asyncHandler } from "../lib/asyncHandler.js";
import { getPaging } from "../lib/pagination.js";
import SecurityAutomation from "../models/SecurityAutomation.js";
import AuditLog from "../models/AuditLog.js";

export const listAutomations = asyncHandler(async (req, res) => {
  const { planId, status = "all" } = req.query;
  const { page, pageSize, skip, limit } = getPaging(req.query, { page: 1, pageSize: 20 });

  const where = {};
  if (planId) where.planId = planId;
  if (status !== "all") where.status = status;

  const [rows, total] = await Promise.all([
    SecurityAutomation.find(where).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    SecurityAutomation.countDocuments(where),
  ]);

  res.json({ rows, page, pageSize, total });
});

export const createAutomation = asyncHandler(async (req, res) => {
  const doc = await SecurityAutomation.create(req.body);
  await AuditLog.create({ action: "CREATE_AUTOMATION", resource: `SecurityAutomation:${doc._id}`, changes: JSON.stringify(req.body), user: req.user?.email || "system", ip: req.ip });
  res.status(201).json(doc);
});

export const updateAutomation = asyncHandler(async (req, res) => {
  const doc = await SecurityAutomation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ message: "Automation not found" });
  await AuditLog.create({ action: "UPDATE_AUTOMATION", resource: `SecurityAutomation:${doc._id}`, changes: JSON.stringify(req.body), user: req.user?.email || "system", ip: req.ip });
  res.json(doc);
});

export const deleteAutomation = asyncHandler(async (req, res) => {
  const doc = await SecurityAutomation.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Automation not found" });
  await AuditLog.create({ action: "DELETE_AUTOMATION", resource: `SecurityAutomation:${doc._id}`, user: req.user?.email || "system", ip: req.ip });
  res.json({ ok: true });
});
