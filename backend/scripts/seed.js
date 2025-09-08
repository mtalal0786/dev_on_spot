// backend/scripts/seed.js
import mongoose from "mongoose";
import "dotenv/config";

import Instance from "../models/Instance.js";
import Quota from "../models/Quota.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dev_on_spot";
const DB_NAME = process.env.MONGODB_DB || "dev_on_spot";

async function main() {
  console.log(`[seed] Connecting to ${MONGO_URI} (db=${DB_NAME})...`);
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("[seed] Connected.");

  console.log("[seed] Clearing collections…");
  await Instance.deleteMany({});
  await Quota.deleteMany({});

  console.log("[seed] Inserting instances…");
  await Instance.insertMany([
    {
      name: "web-server-01",
      type: "t3.large",
      region: "us-east-1",
      status: "Running",
      profile: "web",
      cpu: 45,
      ram: 62,
      gpu: 0,
      disk: 18,
      netIn: 180,
      netOut: 240,
      uptimeSec: 15 * 86400 + 4 * 3600,
    },
    {
      name: "ml-training-gpu",
      type: "p3.2xlarge",
      region: "us-west-2",
      status: "Running",
      profile: "gpu",
      cpu: 55,
      ram: 72,
      gpu: 66,
      disk: 22,
      netIn: 420,
      netOut: 390,
      uptimeSec: 2 * 86400 + 6 * 3600,
    },
    {
      name: "database-primary",
      type: "r5.xlarge",
      region: "us-east-1",
      status: "Running",
      profile: "db",
      cpu: 23,
      ram: 67,
      gpu: 0,
      disk: 34,
      netIn: 320,
      netOut: 295,
      uptimeSec: 45 * 86400,
    },
    {
      name: "api-server-02",
      type: "t3.medium",
      region: "eu-west-1",
      status: "Stopped",
      profile: "web",
    },
  ]);

  console.log("[seed] Inserting quotas…");
  await Quota.insertMany([
    { key: "gpuHours", used: 124, allocated: 200 },
    { key: "instanceHours", used: 340, allocated: 500 },
    { key: "storageGB", used: 1250, allocated: 2000 },
    { key: "budgetUSD", used: 2840, allocated: 5000 },
  ]);

  console.log("[seed] Seed complete ✅");
}

try {
  await main();
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error("[seed] Failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
}
