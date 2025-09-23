import { asyncHandler } from '../lib/asyncHandler.js';
import { getPaging } from '../lib/pagination.js';
import { like } from '../lib/buildQuery.js';
import Firewall from '../models/Firewall.js';

export const listFirewalls = asyncHandler(async (req, res) => {
  const { q, region = 'all', status = 'all', sort = 'blocked24h' } = req.query;
  const { page, pageSize, skip, limit } = getPaging(req.query, { page: 1, pageSize: 15 });

  const where = {};
  if (q) where.$or = [{ name: like(q) }, { vpc: like(q) }];
  if (region !== 'all') where.region = region;
  if (status !== 'all') where.status = status;

  const sortMap = {
    blocked24h: { blocked24h: -1 },
    openPorts: { openPorts: -1 },
    rules: { rules: -1 },
    name: { name: 1 },
  };

  const [rows, total] = await Promise.all([
    Firewall.find(where).sort(sortMap[sort] || { blocked24h: -1 }).skip(skip).limit(limit),
    Firewall.countDocuments(where),
  ]);

  res.json({ rows, page, pageSize, total });
});
