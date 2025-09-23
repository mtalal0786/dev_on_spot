import { asyncHandler } from "../lib/asyncHandler.js";
import { getPaging } from "../lib/pagination.js";
import Certificate from "../models/Certificate.js";

// Escape regex special characters
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const listCertificates = asyncHandler(async (req, res) => {
  const { q, status = "all", issuer = "all", sort = "daysLeft" } = req.query;
  const { page, pageSize, skip, limit } = getPaging(req.query, { page: 1, pageSize: 15 });

  const where = {};

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i"); // case-insensitive
    where.$or = [
      { domain: regex },
      { issuer: regex },
      // Remove _id search if q is not a valid ObjectId
    ];
  }

  if (status !== "all") where.status = status;
  if (issuer !== "all") where.issuer = issuer;

  const sortBy = sort === "domain" ? { domain: 1 } : { expiresAt: 1 };

  const [rowsRaw, total] = await Promise.all([
    Certificate.find(where).sort(sortBy).skip(skip).limit(limit),
    Certificate.countDocuments(where),
  ]);

  const today = new Date();
  const rows = rowsRaw.map((c) => {
    const expiresDate = new Date(c.expiresAt);
    const diffDays = Math.ceil((expiresDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      id: c._id.toString(),
      domain: c.domain,
      issuer: c.issuer,
      expires: expiresDate.toISOString().split("T")[0],
      daysLeft: diffDays,
      status: c.status,
    };
  });

  res.json({ rows, page, pageSize, total });
});
