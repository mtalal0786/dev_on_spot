import { mailer } from '../config/mailer.js';
import UserPref from '../models/UserPref.js';

/**
 * Sends email notifications to all users with emailAlertsEnabled = true
 * @param {Object} alert SecurityAlert document
 */
export async function notifyEmailSubscribers(alert) {
  const subscribers = await UserPref.find({ emailAlertsEnabled: true, email: { $exists: true } }).lean();

  for (const user of subscribers) {
    try {
      await mailer.sendMail({
        to: user.email,
        subject: `[Security] ${alert.severity}: ${alert.message}`,
        text: `
Severity: ${alert.severity}
Message: ${alert.message}
Detail: ${alert.detail || 'N/A'}
Time: ${new Date(alert.timestamp).toLocaleString()}
        `,
      });
      console.log(`✅ Alert sent to ${user.email}`);
    } catch (err) {
      console.error(`❌ Failed to send alert to ${user.email}:`, err.message);
    }
  }
}
