// backend/config/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// console.log("Mailer env vars:", {
//   SMTP_HOST: process.env.SMTP_HOST ? "[set]" : "[missing]",
//   SMTP_PORT: process.env.SMTP_PORT ? "[set]" : "[missing]",
//   SMTP_USER: process.env.SMTP_USER ? "[set]" : "[missing]",
// });


const SMTP_USER = process.env.SMTP_USER || "muhammad.talal@zmedia.com.pk";
const SMTP_PASS = process.env.SMTP_PASS || "C,?DxZvhcM!^";
const SMTP_HOST = process.env.SMTP_HOST || "mail.zmedia.com.pk";
const SMTP_PORT = process.env.SMTP_PORT || 465;
const MAIL_FROM = process.env.MAIL_FROM || `"DevOnSpot Alerts" <${SMTP_USER}>`;
// const MAIL_TO = process.env.MAIL_TO || "talalshahbaz000786@gmail.com";

// console.log("Mailer config:", { host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER });

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  // console.error("❌ SMTP environment variables missing. Check your .env file.");
}

const portNum = Number(SMTP_PORT) || 587;
const secure = portNum === 465; // implicit TLS on 465

export const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: portNum,
  secure, // true for 465, false for 587/25 (STARTTLS)
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  // logger: true,
  // debug: true,
  // If your provider uses self-signed certs, uncomment:
  // tls: { rejectUnauthorized: false },
});

export function defaultFrom() {
  return MAIL_FROM || `"DevOnSpot" <${SMTP_USER}>`;
}

export async function verifyMailer() {
  try {
    await mailer.verify();
    // console.log("✅ SMTP connection verified.");
  } catch (err) {
    // console.error("❌ SMTP verify failed:", err);
  }
}
