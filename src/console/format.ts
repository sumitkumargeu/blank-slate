export function formatRelative(iso?: string): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  const d = Date.now() - t;
  if (d < 1000) return "just now";
  if (d < 60_000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  return formatClock(iso);
}

export function formatClock(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}Z`;
}