import Alert from "../models/Alert.js";

export async function list(_req, res) {
  const rows = await Alert.find({ active: true }).sort({ severity: -1, createdAt: -1 }).lean();
  res.json(rows.map(a => ({
    id: String(a._id),
    type: a.type,
    resource: a.instanceId ? String(a.instanceId) : "global",
    usage: a.value,
    threshold: a.threshold,
    severity: a.severity,
  })));
}
