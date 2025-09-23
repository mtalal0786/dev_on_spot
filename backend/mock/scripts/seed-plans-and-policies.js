import connectDB from "../config/db.js";
import SecurityPlan from "../models/SecurityPlan.js";
import SecurityRule from "../models/SecurityRule.js";
import SecurityList from "../models/SecurityList.js";
import RateLimitPolicy from "../models/RateLimitPolicy.js";
import LoginPolicy from "../models/LoginPolicy.js";
import SecurityHeaderPolicy from "../models/SecurityHeaderPolicy.js";
import ScanPlan from "../models/ScanPlan.js";
import SecurityAutomation from "../models/SecurityAutomation.js";

await connectDB();

await Promise.all([
  SecurityPlan.deleteMany({}),
  SecurityRule.deleteMany({}),
  SecurityList.deleteMany({}),
  RateLimitPolicy.deleteMany({}),
  LoginPolicy.deleteMany({}),
  SecurityHeaderPolicy.deleteMany({}),
  ScanPlan.deleteMany({}),
  SecurityAutomation.deleteMany({}),
]);

const plan = await SecurityPlan.create({
  name: "Default Security Plan",
  description: "Baseline policies for all services",
  owner: "security@company.com",
  mode: "Monitor",
  targets: ["app.devonspot.com", "api.devonspot.com"],
  vpc: "vpc-0123456789abcdef0",
  status: "OK",
  rulesCount: 0,
  listsCount: 0,
});

await SecurityRule.insertMany([
  { planId: plan._id, name: "Block /wp-admin", action: "Deny", conditions: `path=/wp-admin`, priority: 10 },
  { planId: plan._id, name: "Challenge from RU", action: "Challenge", conditions: `country=RU`, priority: 20 },
]);

await SecurityList.insertMany([
  { planId: plan._id, name: "Blocked IPs", type: "Blocklist", entries: 4 },
  { planId: plan._id, name: "Allow AWS Health", type: "Allowlist", entries: 2 },
]);

await RateLimitPolicy.create({
  planId: plan._id,
  globalLimit: "1000/hour",
  perIpLimit: "100/minute",
  loginLimit: "5/minute",
  action: "Block",
  duration: "15m",
});

await LoginPolicy.create({
  planId: plan._id,
  accountLockout: { enabled: true, threshold: 5, duration: 15 },
  mfa: { enabled: true, methods: ["TOTP", "Email"] },
});

await SecurityHeaderPolicy.create({
  planId: plan._id,
  hsts: true, csp: true, xFrameOptions: true, xContentTypeOptions: true,
  minTlsVersion: "TLS1.2", forceHttps: true, ocspStapling: true,
});

await ScanPlan.insertMany([
  { planId: plan._id, name: "Daily Vulnerability Scan", frequency: "Daily", targets: "All services", status: "Active", lastRun: new Date() },
  { planId: plan._id, name: "Weekly Malware Scan", frequency: "Weekly", targets: "Uploads only", status: "Active" },
]);

await SecurityAutomation.insertMany([
  { planId: plan._id, name: "Critical Malware Response", trigger: "AlertSeverity>=CRITICAL AND Source=Malware", action: "Quarantine", status: "Active" },
  { planId: plan._id, name: "Brute Force Response", trigger: "AlertMessage=Brute Force Attack Detected", action: "BlockIP", status: "Active" },
]);

console.log("✅ Seeded SecurityPlan and submodules");
process.exit(0);
