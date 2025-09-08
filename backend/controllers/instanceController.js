import Instance from "../models/Instance.js";

function fmtUptime(sec = 0) {
  const d = Math.floor(sec / 86400);
  sec -= d * 86400;
  const h = Math.floor(sec / 3600);
  sec -= h * 3600;
  const m = Math.floor(sec / 60);
  return `${d}d ${h}h ${m}m`;
}

export async function list(_req, res) {
  const rows = await Instance.find().sort({ createdAt: -1 });
  res.json(
    rows.map((s) => ({
      id: String(s._id),
      name: s.name,
      type: s.type,
      region: s.region,
      profile: s.profile,
      status: s.status,
      cpu: s.cpu,
      ram: s.ram,
      gpu: s.gpu,
      disk: s.disk,
      netIn: s.netIn,
      netOut: s.netOut,
      uptime: fmtUptime(s.uptimeSec || 0),
    }))
  );
}

export async function getById(req, res) {
  const s = await Instance.findById(req.params.id);
  if (!s) return res.status(404).json({ error: "Instance not found" });

  res.json({
    id: String(s._id),
    name: s.name,
    type: s.type,
    region: s.region,
    profile: s.profile,
    status: s.status,
    cpu: s.cpu,
    ram: s.ram,
    gpu: s.gpu,
    disk: s.disk,
    netIn: s.netIn,
    netOut: s.netOut,
    uptime: fmtUptime(s.uptimeSec || 0),
  });
}

export async function create(req, res) {
  const body = req.body;
  const row = await Instance.create({
    name: body.name,
    type: body.type,
    region: body.region,
    profile: body.profile || "web",
    status: body.status || "Running",
    cpu: body.cpu ?? 0,
    ram: body.ram ?? 0,
    gpu: body.gpu ?? 0,
    disk: body.disk ?? 0,
  });
  res.json({ id: String(row._id) });
}

export async function update(req, res) {
  await Instance.updateOne({ _id: req.params.id }, { $set: req.body });
  res.json({ ok: true });
}

export async function remove(req, res) {
  await Instance.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
}

export async function action(req, res) {
  const { action } = req.body;
  if (action === "start")
    await Instance.updateOne({ _id: req.params.id }, { $set: { status: "Running" } });
  if (action === "stop")
    await Instance.updateOne({ _id: req.params.id }, { $set: { status: "Stopped" } });
  if (action === "reboot")
    await Instance.updateOne({ _id: req.params.id }, { $set: { status: "Running" } });
  res.json({ ok: true });
}
