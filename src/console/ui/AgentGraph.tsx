import { useId } from "react";
import { useFriday, AGENT_PIPELINE } from "../store";
import type { AgentState } from "../types";
import { AgentVisual } from "./AgentVisuals";
import { StatusBadge } from "./StatusDot";
import { formatRelative } from "../format";

export function AgentGraph() {
  const { agents, selectedAgentId, setSelectedAgent } = useFriday();

  return (
    <section className="holo-panel relative flex-1 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <ScanLine />
      <header className="relative z-10 flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Agent Pipeline</div>
          <div className="mt-0.5 font-mono text-sm text-foreground/90">Radar → Whisper → Switchboard → Planner → Cortex → Shield → Gatekeeper → Forge → Oracle</div>
        </div>
      </header>

      <div className="relative z-10 h-[calc(100%-64px)] overflow-x-auto overflow-y-auto p-6">
        <div className="relative flex min-w-[1480px] items-stretch gap-4">
          {AGENT_PIPELINE.map((id, idx) => {
            const a = agents.find((x) => x.id === id)!;
            const next = AGENT_PIPELINE[idx + 1];
            const nextAgent = next ? agents.find((x) => x.id === next) : undefined;
            return (
              <div key={id} className="flex items-stretch">
                <AgentNode
                  active={selectedAgentId === id}
                  agent={a}
                  onClick={() => setSelectedAgent(id)}
                />
                {nextAgent && <EdgeFlow active={a.status !== "idle" || nextAgent.status !== "idle"} fromColor={`var(${a.color})`} toColor={`var(${nextAgent.color})`} />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AgentNode({ agent, active, onClick }: { agent: AgentState; active: boolean; onClick: () => void }) {
  const color = `var(${agent.color})`;
  const live = agent.status !== "idle" && agent.status !== "offline";
  return (
    <button
      onClick={onClick}
      className={`relative w-[280px] shrink-0 overflow-hidden rounded-xl border text-left transition-all duration-300 ${
        active ? "scale-[1.02] border-white/20" : "border-white/10 hover:border-white/15"
      }`}
      style={{
        background: "linear-gradient(180deg, oklch(0.22 0.025 260 / 0.7), oklch(0.16 0.02 265 / 0.6))",
        backdropFilter: "blur(14px)",
        boxShadow: live ? `0 0 0 1px ${color}33, 0 12px 40px -16px ${color}88` : "0 12px 30px -20px oklch(0 0 0 / 0.6)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: live ? 1 : 0.4 }} />
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-black/30">
          <AgentVisual agent={agent} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color }}>{agent.id}</div>
          <div className="font-mono text-base font-medium text-foreground">{agent.name}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{agent.role}</div>
          <div className="mt-2"><StatusBadge status={agent.status} /></div>
        </div>
      </div>
      <div className="space-y-1 border-t border-white/5 bg-black/20 px-4 py-3 font-mono text-[10.5px]">
        <Field k="last event" v={agent.last_event ?? "—"} />
        <Field k="last input" v={agent.last_input ?? "—"} />
        <Field k="last output" v={agent.last_output ?? "—"} />
        <Field k="run_id" v={agent.run_id ?? "—"} />
        <Field k="updated" v={formatRelative(agent.updated_at)} />
      </div>
    </button>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">{k}</span>
      <span className="truncate text-foreground/90">{v}</span>
    </div>
  );
}

function EdgeFlow({ active, fromColor, toColor }: { active: boolean; fromColor: string; toColor: string }) {
  const id = `g-${useId().replace(/:/g, "")}`;
  return (
    <div className="relative flex w-16 items-center self-center" aria-hidden>
      <svg viewBox="0 0 64 24" className="h-6 w-full">
        <defs>
          <linearGradient id={id} x1="0" x2="1">
            <stop offset="0%" stopColor={fromColor} />
            <stop offset="100%" stopColor={toColor} />
          </linearGradient>
        </defs>
        <line x1="0" y1="12" x2="64" y2="12" stroke={`url(#${id})`} strokeOpacity="0.4" strokeWidth="1.2" />
        <line x1="0" y1="12" x2="64" y2="12" stroke={`url(#${id})`} strokeWidth="1.8"
          strokeDasharray="6 8"
          style={active ? { animation: "flow-dash 1.6s linear infinite", filter: `drop-shadow(0 0 4px ${fromColor})` } : { opacity: 0.2 }}
        />
        <polygon points="60,8 64,12 60,16" fill={toColor} opacity={active ? 1 : 0.4} />
      </svg>
    </div>
  );
}

function ScanLine() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px"
      style={{
        background: "linear-gradient(90deg, transparent, var(--status-listening), transparent)",
        animation: "scanline 6s ease-in-out infinite",
        opacity: 0.25,
      }}
    />
  );
}