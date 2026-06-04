export function formatRelative(iso?: string): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  const d = Date.now() - t;
  if (d < 1000) return "just now";
  if (d < 60_000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  return new Date(iso).toLocaleTimeString([], { hour12: false });
}

export function formatClock(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour12: false });
}