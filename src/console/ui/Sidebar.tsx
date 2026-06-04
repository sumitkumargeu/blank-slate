import { useFriday, AGENT_PIPELINE } from "../store";
import { StatusDot } from "./StatusDot";

export function Sidebar() {
  const { agents, services, selectedAgentId, selectedServiceId, setSelectedAgent, setSelectedService } = useFriday();

  return (
    <aside className="holo-panel relative flex h-full w-72 shrink-0 flex-col overflow-hidden">
      <div className="border-b border-white/5 p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Navigator</div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <Group title="Core Agents">
          {AGENT_PIPELINE.map((id) => {
            const a = agents.find((x) => x.id === id)!;
            return (
              <NavRow
                key={id}
                active={selectedAgentId === id}
                color={`var(${a.color})`}
                onClick={() => setSelectedAgent(id)}
                title={a.name}
                subtitle={a.role}
                status={a.status}
              />
            );
          })}
        </Group>
        <Group title="Supporting Services">
          {services.map((s) => (
            <NavRow
              key={s.id}
              active={selectedServiceId === s.id}
              color="var(--status-listening)"
              onClick={() => setSelectedService(s.id)}
              title={s.name}
              subtitle={s.role}
              status={s.health === "healthy" ? "success" : s.health === "degraded" ? "warning" : "offline"}
            />
          ))}
        </Group>
        <Group title="Internal Modules">
          {[
            { id: "recovery", name: "Recovery", role: "Embedded in Forge" },
            { id: "permissions", name: "Permission Manager", role: "Shared by Shield/Gatekeeper/Forge" },
            { id: "config", name: "Configuration Manager", role: "Voice · Models · Wake · Paths" },
          ].map((m) => (
            <NavRow key={m.id} color="var(--muted-foreground)" onClick={() => {}} title={m.name} subtitle={m.role} status="idle" />
          ))}
        </Group>
      </div>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/70">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavRow({ title, subtitle, status, color, active, onClick }: {
  title: string; subtitle: string; status: string; color: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-all ${
        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      )}
      <span style={{ color }}><StatusDot status={status} size={7} /></span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-[12px] tracking-wide text-foreground/95">{title}</div>
        <div className="truncate text-[10px] text-muted-foreground">{subtitle}</div>
      </div>
      <ActivityLine color={color} active={status !== "idle" && status !== "offline"} />
    </button>
  );
}

function ActivityLine({ color, active }: { color: string; active: boolean }) {
  return (
    <svg width="32" height="14" viewBox="0 0 32 14" className="opacity-80">
      <path
        d="M0 7 L6 7 L9 3 L13 11 L17 5 L21 9 L25 7 L32 7"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: active ? `drop-shadow(0 0 4px ${color})` : "none", opacity: active ? 1 : 0.25 }}
      />
    </svg>
  );
}