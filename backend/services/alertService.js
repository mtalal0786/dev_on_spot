import Alert from "../models/Alert.js";

export const RULES = [
  { metricKey: "cpu",   type: "CPU",                 high: 90,  med: 80,  low: 70,  max: 100 },
  { metricKey: "ram",   type: "Memory",              high: 90,  med: 80,  low: 70,  max: 100 },
  { metricKey: "gpu",   type: "GPU",                 high: 90,  med: 80,  low: 70,  max: 100 },
  { metricKey: "disk",  type: "Disk",                high: 90,  med: 80,  low: 70,  max: 100 },
  { metricKey: "netIn", type: "Network In (KB/s)",   high: 1500,med: 1200,low: 900, max: 2000 },
  { metricKey: "netOut",type: "Network Out (KB/s)",  high: 1500,med: 1200,low: 900, max: 2000 },
];

async function upsertAlert(instanceId, rule, severity, value, threshold) {
  await Alert.updateOne(
    { instanceId, metricKey: rule.metricKey, active: true },
    { $set: { type: rule.type, severity, value, threshold } },
    { upsert: true }
  );
}

async function resolveAlert(instanceId, rule) {
  await Alert.updateMany(
    { instanceId, metricKey: rule.metricKey, active: true },
    { $set: { active: false } }
  );
}

export async function evaluate(instanceId, snapshot) {
  for (const rule of RULES) {
    const v = snapshot[rule.metricKey] ?? 0;
    if (v >= rule.high)      await upsertAlert(instanceId, rule, "high",   v, rule.high);
    else if (v >= rule.med)  await upsertAlert(instanceId, rule, "medium", v, rule.med);
    else if (v >= rule.low)  await upsertAlert(instanceId, rule, "low",    v, rule.low);
    else                     await resolveAlert(instanceId, rule);
  }
}
