import { useFriday } from "../store";
import { StatusBadge } from "./StatusDot";

export function WatchtowerPanel() {
  const { watch } = useFriday();
  const rows: [string, string, "success" | "warning" | "error" | "offline"][] = [
    ["Rustpotter", watch.rustpotter, watch.rustpotter === "online" ? "success" : "error"],
    ["Whisper.cpp", watch.whisper_cpp, watch.whisper_cpp === "online" ? "success" : "error"],
    ["Apple Intelligence", watch.apple_intel, watch.apple_intel === "online" ? "success" : "warning"],
    ["Qwen3-1.7B", watch.qwen_1_7b, watch.qwen_1_7b === "online" ? "success" : "error"],
    ["Qwen3-4B", watch.qwen_4b, watch.qwen_4b === "online" ? "success" : "error"],
    ["Terminal Runtime", watch.terminal_runtime, watch.terminal_runtime === "online" ? "success" : "error"],
    ["WebSocket", watch.websocket, watch.websocket === "online" ? "success" : watch.websocket === "connecting" ? "warning" : "error"],
  ];

  return (
    <section className="holo-panel overflow-hidden">
      <header className="border-b border-white/5 px-4 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Watchtower</div>
        <div className="font-mono text-sm text-foreground">Surveillance Tower · Runtime Telemetry</div>
      </header>
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
        <ul className="space-y-1.5 font-mono text-[11px]">
          {rows.map(([k, v, s]) => (
            <li key={k} className="flex items-center justify-between rounded border border-white/5 bg-black/30 px-3 py-1.5">
              <span className="text-foreground/85">{k}</span>
              <span className="flex items-center gap-2 text-muted-foreground">
                {v} <StatusBadge status={s} />
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between rounded border border-white/5 bg-black/30 px-3 py-1.5">
            <span className="text-foreground/85">Microphone</span>
            <span className="truncate text-muted-foreground">{watch.microphone}</span>
          </li>
        </ul>
        <div className="space-y-3">
          <Gauge label="CPU" value={watch.cpu} color="var(--status-listening)" />
          <Gauge label="Memory" value={watch.memory} color="var(--status-reasoning)" />
          <div className="rounded border border-white/5 bg-black/30 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Recent Failures</div>
            <div className="mt-1 text-[11px] text-foreground/80">
              {watch.failures.length === 0 ? "None in current window" : watch.failures.map((f) => f.message).join(" · ")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded border border-white/5 bg-black/30 p-3">
      <div className="flex items-baseline justify-between font-mono">
        <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</span>
        <span className="text-sm text-foreground">{value}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${value}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
    </div>
  );
}