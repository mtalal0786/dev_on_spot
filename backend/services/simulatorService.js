import Instance from "../models/Instance.js";
import { buildSeries, step } from "../lib/randomWalk.js";
import { evaluate as evaluateAlerts } from "./alertService.js";

const BUF_SIZE = 120; // ~2 hours if 1/min
const buffers = new Map(); // instanceId -> series

const PROFILES = {
  web: { cpu: 35, ram: 55, gpu: 5,  disk: 8,  netIn: 200, netOut: 250 },
  db : { cpu: 25, ram: 60, gpu: 0,  disk: 25, netIn: 300, netOut: 280 },
  gpu: { cpu: 45, ram: 70, gpu: 60, disk: 15, netIn: 350, netOut: 300 },
};

function ensureBuffer(id, profile) {
  if (buffers.has(id)) return buffers.get(id);
  const p = PROFILES[profile] ?? PROFILES.web;
  const buf = {
    cpu:   buildSeries(p.cpu,   100),
    ram:   buildSeries(p.ram,   100),
    gpu:   buildSeries(p.gpu,   100),
    disk:  buildSeries(p.disk,  100),
    netIn: buildSeries(p.netIn, 2000, 60, { clamp: [0, 2000], jitterPct: 0.12 }),
    netOut:buildSeries(p.netOut,2000, 60, { clamp: [0, 2000], jitterPct: 0.12 }),
  };
  buffers.set(id, buf);
  return buf;
}

function push(buf, key, max, opts) {
  const last = buf[key][buf[key].length - 1]?.value ?? (opts?.baseline ?? 40);
  const val = step(last, max, opts?.jitterPct ?? 0.07, opts?.clamp ?? [0, max]);
  buf[key].push({ time: new Date(), value: val });
  if (buf[key].length > BUF_SIZE) buf[key].shift();
  return val;
}

export async function tickOnce() {
  const running = await Instance.find({ status: "Running" }).lean();
  for (const inst of running) {
    const id = String(inst._id);
    const buf = ensureBuffer(id, inst.profile);
    const p = PROFILES[inst.profile] ?? PROFILES.web;

    const cpu   = push(buf, "cpu",   100, { baseline: p.cpu });
    const ram   = push(buf, "ram",   100, { baseline: p.ram });
    const gpu   = push(buf, "gpu",   100, { baseline: p.gpu });
    const disk  = push(buf, "disk",  100, { baseline: p.disk });
    const netIn = push(buf, "netIn", 2000, { baseline: p.netIn, clamp: [0,2000], jitterPct: 0.12 });
    const netOut= push(buf, "netOut",2000, { baseline: p.netOut, clamp: [0,2000], jitterPct: 0.12 });

    await Instance.updateOne({ _id: inst._id }, {
      $set: { cpu, ram, gpu, disk, netIn, netOut },
      $inc: { uptimeSec: 60 },
    });

    await evaluateAlerts(id, { cpu, ram, gpu, disk, netIn, netOut });
  }
}

export function getSeries(instanceId, keys = ["cpu","ram","gpu","disk","netIn","netOut"]) {
  const buf = buffers.get(String(instanceId));
  const empty = keys.reduce((a,k)=> (a[k]=[],a), {});
  if (!buf) return empty;
  const out = {};
  for (const k of keys) {
    out[k] = buf[k].map(p => ({
      time: p.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: p.value,
    }));
  }
  return out;
}

let timer = null;
export function start(intervalMs = 60_000) {
  if (timer) return;
  timer = setInterval(() => tickOnce().catch(console.error), intervalMs);
  console.log(`Simulator running every ${intervalMs/1000}s`);
}
export function stop(){ if (timer) clearInterval(timer); timer = null; }
