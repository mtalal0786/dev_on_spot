import { asyncHandler } from "../lib/asyncHandler.js";
import { getPaging } from "../lib/pagination.js";
import SecurityList from "../models/SecurityList.js";
import AuditLog from "../models/AuditLog.js";

// helpers
const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeByType = (type, entries) => {
  if (type === "Geo Block") {
    // country codes uppercased & unique
    const set = new Set(entries.map((e) => String(e).trim().toUpperCase()).filter(Boolean));
    return Array.from(set);
  }
  // IPs/CIDRs trimmed & unique
  const set = new Set(entries.map((e) => String(e).trim()).filter(Boolean));
  return Array.from(set);
};

export const listLists = asyncHandler(async (req, res) => {
  const { planId, type } = req.query;
  const { page, pageSize, skip, limit } = getPaging(req.query, { page: 1, pageSize: 20 });

  const where = {};
  if (planId) where.planId = planId;
  if (type && type !== "all") where.type = type;

  const [rows, total] = await Promise.all([
    SecurityList.find(where).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    SecurityList.countDocuments(where),
  ]);

  res.json({ rows, page, pageSize, total });
});

export const createList = asyncHandler(async (req, res) => {
  const { planId, name, type } = req.body;

  // entries can be array or comma/space-separated string
  let entries = toArray(req.body.entries);
  entries = normalizeByType(type, entries);

  const payload = {
    planId,
    name,
    type,
    entries,
  };

  const list = await SecurityList.create(payload);

  await AuditLog.create({
    action: "CREATE_LIST",
    resource: `SecurityList:${list._id}`,
    changes: JSON.stringify(payload),
    user: req.user?.email || "system",
    ip: req.ip,
  });

  res.status(201).json(list);
});

export const updateList = asyncHandler(async (req, res) => {
  const { type } = req.body;

  const update = { ...req.body };

  if (update.entries !== undefined) {
    let entries = toArray(update.entries);
    const finalType = type || (await SecurityList.findById(req.params.id).select("type"))?.type;
    entries = normalizeByType(finalType, entries);
    update.entries = entries;
  }

  const updated = await SecurityList.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true, // ensure our schema validators run on updates
    context: "query",
  });

  if (!updated) return res.status(404).json({ message: "List not found" });

  await AuditLog.create({
    action: "UPDATE_LIST",
    resource: `SecurityList:${updated._id}`,
    changes: JSON.stringify(update),
    user: req.user?.email || "system",
    ip: req.ip,
  });

  res.json(updated);
});

export const deleteList = asyncHandler(async (req, res) => {
  const deleted = await SecurityList.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "List not found" });

  await AuditLog.create({
    action: "DELETE_LIST",
    resource: `SecurityList:${deleted._id}`,
    user: req.user?.email || "system",
    ip: req.ip,
  });

  res.json({ ok: true });
});
