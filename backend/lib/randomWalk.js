export function step(prev, max, jitterPct = 0.07, clamp = [0, max]) {
  const jitter = (Math.random() - 0.5) * (max * jitterPct);
  let next = prev + jitter;
  next = Math.max(clamp[0], Math.min(clamp[1], next));
  return Math.round(next);
}

export function buildSeries(startVal, max, points = 60, opts = {}) {
  const arr = [];
  let v = startVal;
  for (let i = points - 1; i >= 0; i--) {
    const ts = new Date(Date.now() - i * 60_000);
    v = step(v, max, opts.jitterPct ?? 0.07, opts.clamp ?? [0, max]);
    arr.push({ time: ts, value: v });
  }
  return arr;
}
