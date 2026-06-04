import { useMemo, useState } from "react";
import { useFriday } from "../store";
import type { RuntimeEvent } from "../types";
import { formatClock } from "../format";
import { StatusBadge } from "./StatusDot";

type Tab = "timeline" | "ledger" | "memory" | "runs" | "errors";

export function BottomDrawer() {
  const [tab, setTab] = useState<Tab>("timeline");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const { events, memory } = useFriday();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (sourceFilter !== "all" && e.source_type !== sourceFilter) return false;
      if (tab === "errors" && e.status !== "error" && e.status !== "warning") return false;
      if (!q) return true;
      return JSON.stringify(e).toLowerCase().includes(q);
    });
  }, [events, search, sourceFilter, tab]);

  const runs = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach((e) => {
      if (!map.has(e.run_id)) map.set(e.run_id, []);
      map.get(e.run_id)!.push(e);
    });
    return Array.from(map.entries()).slice(0, 20);
  }, [events]);

  return (
    <section className="holo-panel-strong relative flex h-[260px] shrink-0 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <div className="flex items-center gap-1">
          {(["timeline", "ledger", "memory", "runs", "errors"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] transition-colors ${
                tab === t ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground/90"
              }`}
            >{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {tab !== "memory" && (
            <div className="flex items-center gap-1">
              {["all", "agent", "service", "system"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSourceFilter(s)}
                  className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] ${
                    sourceFilter === s ? "border-status-listening/60 bg-status-listening/10 text-foreground" : "border-white/10 text-muted-foreground"
                  }`}
                >{s}</button>
              ))}
            </div>
          )}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search events, run_id, payloads…"
            className="w-64 rounded-md border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:border-status-listening/60 focus:outline-none"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[11px]">
        {tab === "timeline" || tab === "ledger" || tab === "errors" ? (
          <ul className="space-y-1">
            {filtered.length === 0 && <Empty>No events yet</Empty>}
            {filtered.map((e) => <EventRow key={e.event_id} e={e} />)}
          </ul>
        ) : tab === "memory" ? (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {memory.map((m) => (
              <li key={m.namespace + m.key} className="rounded border border-white/10 bg-black/30 p-2">
                <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{m.namespace}</div>
                <div className="text-foreground/90">{m.key}</div>
                <div className="mt-1 break-all text-foreground/80">{typeof m.value === "string" ? m.value : JSON.stringify(m.value)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-1">
            {runs.map(([id, evs]) => (
              <li key={id} className="rounded border border-white/10 bg-black/30 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/90">{id}</span>
                  <span className="text-muted-foreground">{evs.length} events · last {formatClock(evs[0].timestamp)}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {evs.slice(0, 9).reverse().map((e) => (
                    <span key={e.event_id} className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{e.source}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function EventRow({ e }: { e: RuntimeEvent }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded border border-white/5 bg-black/20">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-2 py-1.5 text-left">
        <span className="w-16 shrink-0 text-muted-foreground">{formatClock(e.timestamp)}</span>
        <span className="w-28 shrink-0 truncate text-foreground/80">{e.source}</span>
        <span className="w-44 shrink-0 truncate text-status-listening">{e.event_type}</span>
        <span className="flex-1 truncate text-foreground/85">{e.message}</span>
        <span className="shrink-0"><StatusBadge status={e.status} /></span>
        <span className="w-40 shrink-0 truncate text-muted-foreground">{e.run_id}</span>
      </button>
      {open && (
        <pre className="max-h-60 overflow-auto border-t border-white/5 bg-black/40 p-2 text-[10.5px] text-foreground/85">
{JSON.stringify(e, null, 2)}
        </pre>
      )}
    </li>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <li className="rounded border border-dashed border-white/10 p-4 text-center text-muted-foreground">{children}</li>;
}