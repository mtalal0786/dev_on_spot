import { asyncHandler } from "../lib/asyncHandler.js";
import { getPaging } from "../lib/pagination.js";
import AuditLog from "../models/AuditLog.js";

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const { page, pageSize, skip, limit } = getPaging(req.query, { page: 1, pageSize: 20 });

  const where = {};
  if (q) {
    const rx = { $regex: q, $options: "i" };
    where.$or = [{ action: rx }, { resource: rx }, { user: rx }, { ip: rx }, { changes: rx }];
  }

  const [rows, total] = await Promise.all([
    AuditLog.find(where).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(where),
  ]);

  res.json({ rows, page, pageSize, total });
});
