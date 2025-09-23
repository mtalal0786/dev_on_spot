import { asyncHandler } from '../lib/asyncHandler.js';
import LoginAttempt from '../models/LoginAttempt.js';
import { getPaging } from '../lib/pagination.js';
import { like } from '../lib/buildQuery.js';
import mongoose from 'mongoose';

export const listLoginAttempts = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, limit } = getPaging(req.query, { page: 1, pageSize: 15 });
  const { q, result = 'all', method = 'all' } = req.query;

  const where = {};

  // Search by user, ip, reason, or ID
  if (q) {
    const trimmedQ = q.trim();
    if (mongoose.Types.ObjectId.isValid(trimmedQ)) {
      where._id = new mongoose.Types.ObjectId(trimmedQ);
    } else {
      where.$or = [{ user: like(trimmedQ) }, { ip: like(trimmedQ) }, { reason: like(trimmedQ) }];
    }
  }

  if (result !== 'all') where.result = result;
  if (method !== 'all') where.method = method;

  const [rowsRaw, total] = await Promise.all([
    LoginAttempt.find(where).sort({ time: -1 }).skip(skip).limit(limit),
    LoginAttempt.countDocuments(where),
  ]);

  // Map MongoDB documents to frontend-friendly format
  const rows = rowsRaw.map((a) => ({
    id: a._id.toString(),
    user: a.user,
    ip: a.ip,
    method: a.method,
    result: a.result,
    reason: a.reason || "",
    time: a.time.toISOString(),
  }));

  res.json({ rows, page, pageSize, total });
});
