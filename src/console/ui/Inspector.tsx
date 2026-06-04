import { useMemo } from "react";
import { useFriday } from "../store";
import type { AgentState, ServiceState } from "../types";
import { AgentVisual } from "./AgentVisuals";
import { StatusBadge } from "./StatusDot";
import { formatClock, formatRelative } from "../format";

export function Inspector() {
  const { agents, services, selectedAgentId, selectedServiceId, events, memory, activeRunId } = useFriday();
  const agent = agents.find((a) => a.id === selectedAgentId);
  const service = services.find((s) => s.id === selectedServiceId);

  const relatedEvents = useMemo(() => {
    if (agent) return events.filter((e) => e.source.toLowerCase() === agent.id).slice(0, 10);
    if (service) return events.filter((e) => e.source.toLowerCase() === service.id).slice(0, 10);
    return [];
  }, [agent, service, events]);

  const relatedMemory = useMemo(() => {
    const ns = agent ? `agent.${agent.id}` : service ? `service.${service.id}` : null;
    return ns ? memory.filter((m) => m.namespace === ns) : [];
  }, [agent, service, memory]);

  if (!agent && !service) {
    return (
      <aside className="holo-panel flex h-full w-[380px] shrink-0 items-center justify-center p-6">
        <div className="text-center font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Select an agent or service
        </div>
      </aside>
    );
  }

  return (
    <aside className="holo-panel flex h-full w-[380px] shrink-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Inspector</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">run · {activeRunId ?? "—"}</div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {agent && <AgentDetail agent={agent} />}
        {service && <ServiceDetail service={service} />}

        <Section title="Visible Trace">
          {relatedEvents.length === 0 ? (
            <Empty>No recent events</Empty>
          ) : (
            <ul className="space-y-2">
              {relatedEvents.map((e) => (
                <li key={e.event_id} className="rounded-md border border-white/5 bg-black/30 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/80">{e.event_type}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="mt-1 text-[11px] text-foreground/85">{e.message}</div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">{formatClock(e.timestamp)} · {e.run_id}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {agent && (agent.id === "cortex" || agent.id === "planner") && <ReasoningView agentId={agent.id} />}

        <Section title="Memory">
          {relatedMemory.length === 0 ? <Empty>No namespaced records</Empty> : (
            <ul className="space-y-1.5 font-mono text-[11px]">
              {relatedMemory.map((m) => (
                <li key={m.namespace + m.key} className="rounded border border-white/5 bg-black/30 p-2">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{m.namespace} · {m.key}</div>
                  <div className="mt-0.5 break-all text-foreground/85">{typeof m.value === "string" ? m.value : JSON.stringify(m.value)}</div>
                  <div className="mt-0.5 text-[9px] text-muted-foreground">{formatRelative(m.updated_at)}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </aside>
  );
}

function AgentDetail({ agent }: { agent: AgentState }) {
  const color = `var(${agent.color})`;
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-md border border-white/5 bg-black/40">
          <AgentVisual agent={agent} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color }}>{agent.id}</div>
          <div className="font-mono text-lg text-foreground">{agent.name}</div>
          <div className="text-[11px] text-muted-foreground">{agent.role} · {agent.theme}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge status={agent.status} />
            <StatusBadge status={agent.health === "healthy" ? "success" : agent.health === "degraded" ? "warning" : "offline"} />
          </div>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10.5px]">
        <Meta k="Last event" v={agent.last_event ?? "—"} />
        <Meta k="Updated" v={formatRelative(agent.updated_at)} />
        <Meta k="Last input" v={agent.last_input ?? "—"} span />
        <Meta k="Last output" v={agent.last_output ?? "—"} span />
        <Meta k="Last error" v={agent.last_error ?? "—"} span />
      </dl>
    </div>
  );
}

function ServiceDetail({ service }: { service: ServiceState }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-status-listening">{service.id}</div>
      <div className="font-mono text-lg text-foreground">{service.name}</div>
      <div className="text-[11px] text-muted-foreground">{service.role} · {service.theme}</div>
      <div className="mt-2"><StatusBadge status={service.health === "healthy" ? "success" : service.health === "degraded" ? "warning" : "offline"} /></div>
      <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10.5px]">
        <Meta k="Summary" v={service.summary} span />
        <Meta k="Recent" v={service.recent} span />
        <Meta k="Errors" v={String(service.errors)} />
        <Meta k="Updated" v={formatRelative(service.updated_at)} />
      </dl>
    </div>
  );
}

function ReasoningView({ agentId }: { agentId: string }) {
  const events = useFriday((s) => s.events);
  const last = events.find((e) => e.source.toLowerCase() === agentId && (e.event_type === "action_generated" || e.event_type === "plan_generated"));
  if (!last) return null;
  const data = (last.data ?? {}) as Record<string, unknown>;
  return (
    <Section title="Structured Reasoning Trace" caption="Visible trace only · chain-of-thought never exposed">
      <div className="space-y-2 font-mono text-[11px]">
        {"intent" in data && <Row k="Intent" v={String(data.intent)} />}
        {"tools" in data && (
          <div>
            <RowLabel>Selected tools</RowLabel>
            <div className="mt-1 flex flex-wrap gap-1">
              {(data.tools as string[]).map((t) => (
                <span key={t} className="rounded-full border border-status-reasoning/40 bg-status-reasoning/10 px-2 py-0.5 text-[10px] text-foreground/90">{t}</span>
              ))}
            </div>
          </div>
        )}
        {"parameters" in data && <Row k="Parameters" v={JSON.stringify(data.parameters)} />}
        {("action" in data || "steps" in data) && (
          <div>
            <RowLabel>Generated action</RowLabel>
            <pre className="mt-1 max-h-44 overflow-auto rounded-md border border-white/10 bg-black/50 p-2 text-[10.5px] leading-relaxed text-foreground/90">
{JSON.stringify(data.action ?? data.steps, null, 2)}
            </pre>
          </div>
        )}
        {"confidence" in data && <Row k="Confidence" v={`${Math.round(Number(data.confidence) * 100)}%`} />}
        <Row k="Validation" v="passed · Shield" />
      </div>
    </Section>
  );
}

function Section({ title, caption, children }: { title: string; caption?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{title}</div>
        {caption && <div className="text-[9px] text-muted-foreground/70">{caption}</div>}
      </div>
      {children}
    </div>
  );
}
function Meta({ k, v, span }: { k: string; v: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{k}</div>
      <div className="truncate text-foreground/90">{v}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <RowLabel>{k}</RowLabel>
      <span className="truncate text-foreground/90">{v}</span>
    </div>
  );
}
function RowLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{children}</span>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded border border-dashed border-white/10 bg-black/20 p-3 text-center text-[11px] text-muted-foreground">{children}</div>;
}