import { useEffect, useState } from "react";
import { useFriday } from "../store";
import { StatusDot } from "./StatusDot";

export function TopBar() {
  const { connected, watch, activeRunId, activeModel } = useFriday();
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const Item = ({ label, value, dot }: { label: string; value: React.ReactNode; dot?: string }) => (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5 font-mono text-xs text-foreground/90">
        {dot && <StatusDot status={dot} size={6} />} {value}
      </div>
    </div>
  );

  return (
    <header className="holo-panel-strong relative z-30 flex h-14 items-center justify-between px-5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-foreground/80">
              FRIDAY · Console
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
              Local-First Runtime Observability
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        <Item label="WS" value={watch.websocket} dot={watch.websocket === "online" ? "success" : watch.websocket === "connecting" ? "warning" : "error"} />
        <Item label="Runtime" value={watch.terminal_runtime} dot={watch.terminal_runtime === "online" ? "success" : "error"} />
        <Item label="Model" value={activeModel} />
        <Item label="Mic" value={watch.microphone} />
        <Item label="Run" value={activeRunId ?? "—"} />
        <Item label="CPU" value={`${watch.cpu}%`} />
        <Item label="MEM" value={`${watch.memory}%`} />
        <Item label="Local" value={clock.toLocaleTimeString([], { hour12: false })} />
        <span className={`h-2 w-2 rounded-full ${connected ? "bg-status-success" : "bg-status-error"}`} style={{ boxShadow: "0 0 10px currentColor" }} />
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 text-status-listening">
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeOpacity="0.5" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx="20" cy="20" r="6" fill="url(#g)" />
      <path d="M20 2 L20 38 M2 20 L38 20" stroke="currentColor" strokeOpacity="0.2" />
    </svg>
  );
}