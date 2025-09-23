import connectDB from '../config/db.js';
import SecurityAlert from '../models/SecurityAlert.js';
import UserPref from '../models/UserPref.js';
import { mailer } from '../config/mailer.js';

const SOURCES = ['WAF', 'IDS', 'Auth', 'CDN'];
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

// Generate a random fake alert
function randomAlert() {
  const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
  const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
  const message =
    severity === 'CRITICAL'
      ? 'Unauthorized Access Attempt'
      : severity === 'HIGH'
      ? 'Brute Force Attack Detected'
      : severity === 'MEDIUM'
      ? 'High Volume of Failed Logins'
      : 'Suspicious Activity';

  const detail =
    severity === 'HIGH'
      ? 'Service: SSH'
      : `Blocked ${Math.random() > 0.5 ? 'POST' : 'GET'} /dashboard from ${[
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
        ].join('.')}`;

  return {
    severity,
    source,
    message,
    detail,
    status: 'Open',
    timestamp: new Date(),
  };
}

// Optionally notify subscribers by email
async function notifyEmail(alert) {
  const subs = await UserPref.find({ emailAlertsEnabled: true }).lean();

  for (const _ of subs) {
    if (!process.env.ALERTS_TEST_EMAIL) continue; // Only send if configured
    try {
      await mailer.sendMail({
        to: process.env.ALERTS_TEST_EMAIL,
        subject: `[Security] ${alert.severity}: ${alert.message}`,
        text: `${alert.message}\n${alert.detail}\n${new Date(alert.timestamp).toLocaleString()}`,
      });
    } catch (err) {
      console.error('❌ Failed to send alert email:', err.message);
    }
  }
}

(async () => {
  await connectDB();
  console.log('🔄 Mock streamer started (emits every ~7s)');

  setInterval(async () => {
    const alert = await SecurityAlert.create(randomAlert());

    // Push realtime toast via socket
    const socket = global.__SOCKET__;
    socket?.emitAlert?.({
      id: alert._id,
      severity: alert.severity,
      message: alert.message,
      detail: alert.detail,
      time: alert.timestamp,
      status: alert.status,
      source: alert.source,
    });

    await notifyEmail(alert);
  }, 7000);
})();
