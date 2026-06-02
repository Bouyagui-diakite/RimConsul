const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** ISO date (YYYY-MM-DD) → dd/mm/yyyy. */
export function isoToFr(iso?: string | null): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/** ISO date → "15 Juillet 2024". */
export function longFrDate(iso?: string | null): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const day = parseInt(m[3], 10);
  const month = MONTHS[parseInt(m[2], 10) - 1] ?? "";
  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${m[1]}`;
}

/** Date object → ISO date (YYYY-MM-DD), local time. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
