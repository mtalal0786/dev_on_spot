import InfraAlert from "../models/InfraAlert.js";

// severity ranking for nicer sorting: high > medium > low
const RANK = { high: 3, medium: 2, low: 1 };

export async function list(_req, res) {
  const rows = await InfraAlert.find({ active: true })
    .sort({ createdAt: -1 }) // newest first
    .lean();

  // If you want "high" to bubble up within same createdAt, sort in memory:
  rows.sort((a, b) => {
    if (a.createdAt?.valueOf() !== b.createdAt?.valueOf()) {
      return b.createdAt - a.createdAt;
    }
    return (RANK[b.severity] || 0) - (RANK[a.severity] || 0);
  });

  res.json(
    rows.map((a) => ({
      id: String(a._id),
      type: a.type,
      resource: a.instanceId ? String(a.instanceId) : "global",
      usage: a.value,
      threshold: a.threshold,
      severity: a.severity,
    }))
  );
}
