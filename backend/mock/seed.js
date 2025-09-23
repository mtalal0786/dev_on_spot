import connectDB from '../config/db.js';
import Certificate from '../models/Certificate.js';
import Firewall from '../models/Firewall.js';
import LoginAttempt from '../models/LoginAttempt.js';
import Malware from '../models/Malware.js';

await connectDB();

await Certificate.deleteMany({});
await Firewall.deleteMany({});
await LoginAttempt.deleteMany({});
await Malware.deleteMany({});

const now = Date.now();
await Certificate.insertMany([
  { domain: 'api.devonspot.com', issuer: "Let's Encrypt", expiresAt: new Date(now + 35*24*3600e3), status: 'Valid' },
  { domain: 'app.devonspot.com', issuer: 'DigiCert',     expiresAt: new Date(now + 10*24*3600e3), status: 'Expiring' },
  { domain: 'cdn.devonspot.com', issuer: 'Sectigo',      expiresAt: new Date(now - 5*24*3600e3),  status: 'Expired' },
]);

await Firewall.insertMany([
  { name: 'Firewall 48', vpc: 'vpc-0123456789abcdef0', region: 'eu-central-1', rules: 12, openPorts: 2, blocked24h: 479, status: 'Active' },
  { name: 'Firewall 47', vpc: 'vpc-0062881a638b09622', region: 'us-west-2',    rules: 11, openPorts: 1, blocked24h: 472, status: 'Active' },
  { name: 'Firewall 46', vpc: 'vpc-00abc',             region: 'us-east-1',    rules: 14, openPorts: 3, blocked24h: 365, status: 'Disabled' },
  // ⬇️ NEW: so your test returns a row
  { name: 'Firewall 45', vpc: 'vpc-00efgh',            region: 'us-east-1',    rules: 18, openPorts: 4, blocked24h: 512, status: 'Active' },
]);

await LoginAttempt.insertMany([
  { user: 'admin', ip: '192.168.1.100', method: 'Password', result: 'Success', reason: '',  time: new Date(now - 1*3600e3) },
  { user: 'user1', ip: '10.0.0.50',     method: '2FA',      result: 'Success', reason: '',  time: new Date(now - 2*3600e3) },
  { user: 'hacker',ip: '203.0.113.1',   method: 'Password', result: 'Failed',  reason: 'Invalid credentials', time: new Date(now - 3*3600e3) },
]);

await Malware.insertMany([
  { severity: 'HIGH',   signature: 'PHP.WebShell.Generic',   path: '/uploads/shell.php',       status: 'Quarantined', detectedAt: new Date(now - 3*3600e3) },
  { severity: 'MEDIUM', signature: 'JS.Trojan.Downloader',   path: '/assets/malicious.js',     status: 'Active',      detectedAt: new Date(now - 5*3600e3) },
  { severity: 'LOW',    signature: 'Suspicious.File.Pattern',path: '/temp/unknown.exe',        status: 'Resolved',    detectedAt: new Date(now - 10*3600e3) },
]);

console.log('✅ Seeded certificates, firewalls, login attempts, malware');
process.exit(0);
