import { asyncHandler } from '../lib/asyncHandler.js';
import UserPref from '../models/UserPref.js';
import SecurityAlert from '../models/SecurityAlert.js';
import Certificate from '../models/Certificate.js';
import Firewall from '../models/Firewall.js';
import LoginAttempt from '../models/LoginAttempt.js';
// import Malare from '../models/Malware.js';

export const getOverview = asyncHandler(async (_req, res) => {
  const [alerts24, certs, fws, attempts] = await Promise.all([
    SecurityAlert.countDocuments({ timestamp: { $gte: new Date(Date.now() - 24 * 3600 * 1000) } }),
    Certificate.find().limit(3).sort({ expiresAt: 1 }),
    Firewall.find().sort({ blocked24h: -1 }).limit(5),
    LoginAttempt.find().sort({ time: -1 }).limit(10),
  ]);

  const agg = await Firewall.aggregate([
    { $group: { _id: null, open: { $sum: '$openPorts' }, blocked: { $sum: '$blocked24h' } } },
  ]);

  const rollup = agg[0] || { open: 0, blocked: 0 };

  const securityScore = Math.max(
    20,
    Math.min(100, 100 - rollup.open + Math.min(30, Math.floor(rollup.blocked / 50)))
  );
  const status = securityScore > 80 ? 'GOOD' : securityScore > 60 ? 'WARNING' : 'CRITICAL';

  res.json({
    securityScore,
    status,
    lastUpdated: new Date(),
    certificates: certs,
    firewalls: fws,
    alerts24,
    loginAttempts: attempts,
  });
});


export const getEmailAlertsPref = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const pref = await UserPref.findOne({ userId });
  res.json({ enabled: pref?.emailAlertsEnabled ?? false });
});

export async function getEmailAlertsPreference(userId) {
  const pref = await UserPref.findOne({ userId });
  return { enabled: pref?.emailAlertsEnabled ?? false };
}

export const setEmailAlertsPref = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { enabled } = req.body || {};
  const pref = await UserPref.findOneAndUpdate(
    { userId },
    { $set: { emailAlertsEnabled: !!enabled } },
    { new: true, upsert: true }
  );
  res.json({ enabled: pref.emailAlertsEnabled });
});
