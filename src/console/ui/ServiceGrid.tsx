import { useFriday } from "../store";
import { StatusBadge } from "./StatusDot";
import { formatRelative } from "../format";

export function ServiceGrid() {
  const { services, setSelectedService, selectedServiceId } = useFriday();
  return (
    <section className="holo-panel relative overflow-hidden">
      <header className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Supporting Services</div>
          <div className="mt-0.5 font-mono text-sm text-foreground/90">Tuner · Memory · Watchtower · Ledger · Skillbook · Chronos · Archivist</div>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedService(s.id)}
            className={`group rounded-lg border p-3 text-left transition-all ${
              selectedServiceId === s.id ? "border-white/20 bg-white/[0.05]" : "border-white/10 bg-black/20 hover:border-white/15"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-status-listening">{s.id}</span>
              <StatusBadge status={s.health === "healthy" ? "success" : s.health === "degraded" ? "warning" : "offline"} />
            </div>
            <div className="mt-1 font-mono text-sm text-foreground">{s.name}</div>
            <div className="text-[10px] text-muted-foreground">{s.role}</div>
            <div className="mt-2 line-clamp-2 text-[11px] text-foreground/80">{s.summary}</div>
            <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{s.recent}</div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">errors {s.errors} · {formatRelative(s.updated_at)}</div>
          </button>
        ))}
      </div>
    </section>
  );
}