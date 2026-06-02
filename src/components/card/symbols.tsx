/* Mauritania visual identity primitives (drawn, no bitmap dependency). */

const GOLD = "#f1c40f";
const GOLD_LIGHT = "#ffd84d";
const GOLD_DARK = "#e0a800";
const GREEN = "#006233";
const RED = "#cd2a3e";

function starPath(cx: number, cy: number, R: number, r: number, points = 5) {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const ang = ((-90 + i * (180 / points)) * Math.PI) / 180;
    const rad = i % 2 === 0 ? R : r;
    const x = cx + rad * Math.cos(ang);
    const y = cy + rad * Math.sin(ang);
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
  }
  return d + "Z";
}

/** Gold star-and-crescent (horns up), drawn in a 0 0 100 100 box. */
export function StarCrescent({
  size = 24,
  color = GOLD_LIGHT,
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20,55 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0 Z M24,47 a26,26 0 1,0 52,0 a26,26 0 1,0 -52,0 Z"
      />
      <path fill={color} d={starPath(50, 38, 15, 6)} />
    </svg>
  );
}

/** Circular gold medallion on a green field — stands in for the national emblem. */
export function MauritaniaEmblem({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD_DARK})`,
        padding: Math.max(2, size * 0.06),
        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: GREEN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StarCrescent size={size * 0.66} color={GOLD_LIGHT} />
      </div>
    </div>
  );
}

/** Flag of Mauritania: green field, red top/bottom bands, gold star-and-crescent. */
export function MauritaniaFlag({
  width = 34,
  className,
}: {
  width?: number;
  className?: string;
}) {
  const h = width * 0.66;
  const band = h * 0.16;
  return (
    <div
      className={className}
      style={{
        width,
        height: h,
        position: "relative",
        background: GREEN,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: band, background: RED }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: band, background: RED }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <StarCrescent size={h * 0.58} color={GOLD} />
      </div>
    </div>
  );
}

/** Neutral head-and-shoulders placeholder for missing photos. */
export function Silhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="100" height="120" fill="#e9eef3" />
      <circle cx="50" cy="44" r="22" fill="#b9c4d0" />
      <path d="M14,116 C14,86 32,74 50,74 C68,74 86,86 86,116 Z" fill="#b9c4d0" />
    </svg>
  );
}
