import Quota from "../models/Quota.js";

export async function summary(_req, res) {
  const items = await Quota.find();
  const map = (k) => items.find(q => q.key === k) || { used: 0, allocated: 0 };
  res.json({
    gpuHours: map("gpuHours"),
    instanceHours: map("instanceHours"),
    storage: map("storageGB"),
    budget: map("budgetUSD"),
  });
}

export async function upsert(req, res) {
  const { key } = req.params;
  const { used, allocated } = req.body;
  await Quota.updateOne({ key }, { $set: { used, allocated } }, { upsert: true });
  res.json({ ok: true });
}
