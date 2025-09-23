// backend/mock/scripts/test-email.js
import dotenv from "dotenv";
dotenv.config();

import { mailer, verifyMailer, defaultFrom } from "../config/mailer.js";

(async () => {
  await verifyMailer();

  try {
    const info = await mailer.sendMail({
      from: defaultFrom(),
      to: "talalshahbaz000786@gmail.com",
      subject: "Test Email from DevOnSpot",
      text: "This is a plain-text test email from the updated Nodemailer configuration.",
      html: "<p>This is a <b>test</b> email from the updated Nodemailer configuration.</p>",
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send test email:", err);
  }
})();
