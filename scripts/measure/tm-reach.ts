// Verify a target angle A is reachable on the widget's own 0.25 drag lattice, using the same
// angle computation the renderer and grader use (recomputed here, not imported, so a bug in the
// widget's helper cannot certify itself).
const A: [number, number] = [1, 1];
const B: [number, number] = [7, 1];
const GRID = 8;

const angleAt = (p: [number, number], q: [number, number], r: [number, number]) => {
  const u = [q[0] - p[0], q[1] - p[1]];
  const v = [r[0] - p[0], r[1] - p[1]];
  const d = u[0] * v[0] + u[1] * v[1];
  const m = Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]);
  return (Math.acos(Math.max(-1, Math.min(1, d / m))) * 180) / Math.PI;
};

for (const target of [40, 50, 60]) {
  let best: { c: [number, number]; a: number; b: number; c3: number; err: number } | null = null;
  for (let x = 0; x <= GRID; x += 0.25) {
    for (let y = 2; y <= GRID; y += 0.25) {
      const C: [number, number] = [x, y];
      const a = angleAt(A, B, C);
      const b = angleAt(B, A, C);
      const err = Math.abs(a - target);
      if (!best || err < best.err) best = { c: C, a, b, c3: 180 - a - b, err };
    }
  }
  const t = best!;
  console.log(
    `target A=${target}: best lattice C=(${t.c[0]}, ${t.c[1]}) gives A=${t.a.toFixed(2)} B=${t.b.toFixed(2)} C=${t.c3.toFixed(2)} | err ${t.err.toFixed(3)} | sum ${(t.a + t.b + t.c3).toFixed(6)}`
  );
}
