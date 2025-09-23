// controllers/headersController.js

import { asyncHandler } from "../lib/asyncHandler.js";
import SecurityHeaderPolicy from "../models/SecurityHeaderPolicy.js";
import AuditLog from "../models/AuditLog.js";

// getHeadersPolicy function
export const getHeadersPolicy = asyncHandler(async (req, res) => {
  const { planId } = req.query;
  if (!planId) return res.status(400).json({ message: "planId is required" });
  const doc = await SecurityHeaderPolicy.findOne({ planId });
  res.json(doc || null);
});

// upsertHeadersPolicy function
export const upsertHeadersPolicy = asyncHandler(async (req, res) => {
  const { planId, csp, hsts, xFrameOptions, xContentTypeOptions, minTlsVersion, forceHttps, ocspStapling } = req.body;

  if (!planId) return res.status(400).json({ message: "planId is required" });

  // Validate CSP if provided
  if (csp && typeof csp === "object") {
    const { enabled, policy } = csp;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ message: "CSP enabled must be a boolean value" });
    }
    if (typeof policy !== "string") {
      return res.status(400).json({ message: "CSP policy must be a string" });
    }
  }

  // Update the security header policy
  const updated = await SecurityHeaderPolicy.findOneAndUpdate(
    { planId },
    { $set: { hsts, csp, xFrameOptions, xContentTypeOptions, minTlsVersion, forceHttps, ocspStapling } },
    { new: true, upsert: true }
  );

  await AuditLog.create({
    action: "UPSERT_HEADERS_POLICY",
    resource: `SecurityHeaderPolicy:${updated._id}`,
    changes: JSON.stringify(req.body),
    user: req.user?.email || "system",
    ip: req.ip,
  });

  res.json(updated);
});
