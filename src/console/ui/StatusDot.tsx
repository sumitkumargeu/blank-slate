import type { AgentStatus } from "../types";

const MAP: Record<string, string> = {
  idle: "bg-status-idle",
  listening: "bg-status-listening",
  transcribing: "bg-status-transcribing",
  routing: "bg-status-routing",
  planning: "bg-status-planning",
  reasoning: "bg-status-reasoning",
  validating: "bg-status-validating",
  waiting_for_approval: "bg-status-approval",
  executing: "bg-status-executing",
  speaking: "bg-status-speaking",
  success: "bg-status-success",
  warning: "bg-status-warning",
  error: "bg-status-error",
  offline: "bg-status-offline",
  info: "bg-status-listening",
};

export function StatusDot({ status, size = 8, glow = true }: { status: AgentStatus | string; size?: number; glow?: boolean }) {
  const cls = MAP[status] ?? "bg-status-idle";
  return (
    <span
      className={`relative inline-block rounded-full ${cls}`}
      style={{
        width: size,
        height: size,
        boxShadow: glow ? `0 0 ${size * 1.5}px currentColor` : undefined,
      }}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls = MAP[status] ?? "bg-status-idle";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/80">
      <span className={`h-1.5 w-1.5 rounded-full ${cls}`} style={{ boxShadow: "0 0 8px currentColor" }} />
      {status.replace(/_/g, " ")}
    </span>
  );
}