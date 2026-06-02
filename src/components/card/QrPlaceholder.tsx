/* Decorative QR-style matrix (deterministic from a seed). Not a scannable code. */

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = 25;

function inFinder(r: number, c: number): boolean {
  const zones = [
    [0, 0],
    [0, N - 7],
    [N - 7, 0],
  ];
  return zones.some(
    ([zr, zc]) => r >= zr && r < zr + 7 && c >= zc && c < zc + 7,
  );
}

function inSeparator(r: number, c: number): boolean {
  const zones = [
    [0, 0],
    [0, N - 8],
    [N - 8, 0],
  ];
  return zones.some(
    ([zr, zc]) => r >= zr && r < zr + 8 && c >= zc && c < zc + 8,
  );
}

function finderCell(r: number, c: number): boolean {
  // Map to the local 7x7 finder coordinates.
  const lr = r < 7 ? r : r - (N - 7);
  const lc = c < 7 ? c : c - (N - 7);
  if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true; // outer ring
  if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true; // inner block
  return false;
}

export function QrPlaceholder({
  value,
  size = 64,
  fg = "#0c2e1f",
}: {
  value: string;
  size?: number;
  fg?: string;
}) {
  const rnd = mulberry32(hashStr(value));
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (inFinder(r, c)) {
        if (finderCell(r, c)) cells.push({ r, c });
      } else if (!inSeparator(r, c)) {
        if (rnd() > 0.5) cells.push({ r, c });
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${N} ${N}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ borderRadius: 4, background: "#ffffff", padding: 1 }}
    >
      {cells.map(({ r, c }) => (
        <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={fg} />
      ))}
    </svg>
  );
}
