import { asyncHandler } from "../lib/asyncHandler.js";
import SecurityAlert from "../models/SecurityAlert.js";
import UserPref from "../models/UserPref.js";
import { getPaging } from "../lib/pagination.js";
import mongoose from "mongoose";
import { mailer, defaultFrom, verifyMailer } from "../config/mailer.js";
import {getEmailAlertsPreference} from "./securityController.js";

// // ---- one-time SMTP verification (non-blocking) ----
// verifyMailer().catch((e) =>
//   // console.error("⚠️ SMTP verify on controller load failed:", e?.message || e)
// );

// Escape regex for search
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const listAlerts = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, limit } = getPaging(req.query, {
    page: 1,
    pageSize: 15,
  });
  const { q, severity = "all", status = "all", source = "all" } = req.query;

  const where = {};
  if (q) {
    const trimmedQ = q.trim();
    if (mongoose.Types.ObjectId.isValid(trimmedQ)) {
      where._id = new mongoose.Types.ObjectId(trimmedQ);
    } else {
      const regex = new RegExp(escapeRegex(trimmedQ), "i");
      where.$or = [{ message: regex }, { detail: regex }];
    }
  }
  if (severity !== "all") where.severity = severity;
  if (status !== "all") where.status = status;
  if (source !== "all") where.source = source;

  const [rowsRaw, total] = await Promise.all([
    SecurityAlert.find(where).sort({ timestamp: -1 }).skip(skip).limit(limit),
    SecurityAlert.countDocuments(where),
  ]);

  const rows = rowsRaw.map((a) => ({
    id: a._id.toString(),
    severity: a.severity,
    message: a.message,
    detail: a.detail || "",
    source: a.source,
    time: a.timestamp.toISOString(),
    status: a.status,
  }));

  res.json({ rows, page, pageSize, total });
});

// Create alert and email subscribers (plus optional distro in MAIL_TO)
export const createAlert = asyncHandler(async (req, res) => {
  const { severity, message, detail, source, status } = req.body;

  if (!severity || !message) {
    return res
      .status(400)
      .json({ error: "Severity and message are required" });
  }

  // 1) Persist alert
  const alert = await SecurityAlert.create({
    severity,
    message,
    detail,
    source: source || "WAF",
    status: status || "Open",
  });

  // 2) Build recipients
  const subscribers = await UserPref.find({
    emailAlertsEnabled: true,
    email: { $exists: true, $ne: "" },
  })
    .select({ email: 1 })
    .lean();

  const listFromDB = subscribers.map((u) => (u.email || "").trim()).filter(Boolean);

  // Optional distro (comma-separated allowed): MAIL_TO="a@x.com,b@y.com"
  const envTo = (process.env.MAIL_TO || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Deduplicate
  let uniqueRecipients = [...new Set([...listFromDB, ...envTo])];

  // --- NEW: force to current logged-in user only ---
  const userId = req.user?._id || req.user?.id;
  const userEmailFromToken = (req.user?.email || "").trim();
  const prefForUser = userId ? await UserPref.findOne({ userId }).lean() : null;

  // Keep the same variable name for compatibility with your code
  const emailAlertsPref = { enabled: !!(prefForUser?.emailAlertsEnabled) };
  const recipientEmail = (prefForUser?.email || userEmailFromToken || "").trim();

  // Replace recipients with just this one user (if present)
  uniqueRecipients = recipientEmail ? [recipientEmail] : [];

  // 3) Prepare email content
  // console.log("User email alerts preference:", emailAlertsPref.enabled);
  if (!emailAlertsPref.enabled || uniqueRecipients.length === 0) {
    return res.status(201).json({
      ok: true,
      alert: {
        id: alert._id.toString(),
        severity: alert.severity,
        message: alert.message,
        detail: alert.detail || "",
        source: alert.source,
        time: alert.timestamp.toISOString(),
        status: alert.status,
      },
      emailSummary: {
        message:
          !recipientEmail
            ? "no recipient email found for current user"
            : "email alerts are disabled",
      },
    });
  }

  const subject = `[Security] ${alert.severity}: ${alert.message}`;
  const text = [
    `Severity: ${alert.severity}`,
    `Message: ${alert.message}`,
    `Detail: ${alert.detail || "N/A"}`,
    `Source: ${alert.source}`,
    `Time: ${new Date(alert.timestamp).toLocaleString()}`,
  ].join("\n");

  const html = `
  <div style="font-family: Arial, sans-serif; background-color:#f4f4f7; padding:20px; color:#333;">
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <tr>
        <td style="background:#0d6efd; padding:16px 24px; color:#ffffff; font-size:18px; font-weight:bold;">
          🔒 DevOnSpot Security Alert
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h2 style="margin:0 0 16px; font-size:20px; color:#111;">${alert.message}</h2>
          <p style="margin:4px 0;"><b>Severity:</b> <span style="color:${alert.severity === "CRITICAL" ? "#d9534f" : "#555"}">${alert.severity}</span></p>
          <p style="margin:4px 0;"><b>Source:</b> ${alert.source}</p>
          <p style="margin:4px 0 16px;"><b>Time:</b> ${new Date(alert.timestamp).toLocaleString()}</p>

          ${
            alert.detail
              ? `<div style="background:#f9f9f9; border:1px solid #eee; padding:12px; border-radius:6px; font-family:monospace; white-space:pre-wrap;">${escapeHtml(
                  alert.detail
                )}</div>`
              : ""
          }
        </td>
      </tr>
      <tr>
        <td style="background:#f9f9f9; padding:16px; text-align:center; font-size:12px; color:#666;">
          This email was generated automatically by DevOnSpot Security System.<br/>
          &copy; ${new Date().getFullYear()} ZMedia Technologies. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
`;

  // 4) Send emails (one-by-one)
  let sent = 0;
  let failed = 0;
  const results = [];

  if (uniqueRecipients.length > 0) {
    const sendJobs = uniqueRecipients.map(async (to) => {
      try {
        const info = await mailer.sendMail({
          from: defaultFrom(),
          to,
          subject,
          text,
          html,
        });
        sent += 1;
        results.push({ to, ok: true, id: info?.messageId });
        // console.log(`✅ Alert email sent to ${to} (${info?.messageId || "no-id"})`);
      } catch (err) {
        failed += 1;
        results.push({ to, ok: false, error: err?.message || String(err) });
        // console.error(`❌ Failed to send alert email to ${to}:`, err?.message || err);
      }
    });

    await Promise.allSettled(sendJobs);
  } else {
    // console.warn("ℹ️ No email recipients (subscribers empty and MAIL_TO not set).");
  }

  // 5) Respond with summary
  res.status(201).json({
    ok: true,
    alert: {
      id: alert._id.toString(),
      severity: alert.severity,
      message: alert.message,
      detail: alert.detail || "",
      source: alert.source,
      time: alert.timestamp.toISOString(),
      status: alert.status,
    },
    emailSummary: {
      totalRecipients: uniqueRecipients.length,
      sent,
      failed,
      results, // per-recipient status
    },
  });
});


// ---- helpers ----
function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
