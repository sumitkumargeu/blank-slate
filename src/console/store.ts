import { create } from "zustand";
import type {
  AgentState,
  MemoryRecord,
  RuntimeEvent,
  ServiceState,
  WatchtowerSnapshot,
  SafeCommand,
} from "./types";

const EVENT_BUFFER = 500;

export const AGENT_PIPELINE = [
  "radar",
  "whisper",
  "switchboard",
  "planner",
  "cortex",
  "shield",
  "gatekeeper",
  "forge",
  "oracle",
] as const;

const INITIAL_AGENTS: AgentState[] = [
  { id: "radar", name: "Radar", role: "Activation Scanner", theme: "Wake / hotkey / clap detection", color: "--agent-radar", status: "listening", health: "healthy", updated_at: new Date().toISOString() },
  { id: "whisper", name: "Whisper", role: "Speech Processing", theme: "Audio capture & STT", color: "--agent-whisper", status: "idle", health: "healthy", updated_at: new Date().toISOString() },
  { id: "switchboard", name: "Switchboard", role: "Routing Matrix", theme: "Model & route selection", color: "--agent-switchboard", status: "idle", health: "healthy", updated_at: new Date().toISOString() },
  { id: "planner", name: "Planner", role: "Mission Planner", theme: "Multi-step decomposition", color: "--agent-planner", status: "idle", health: "healthy", updated_at: new Date().toISOString() },
  { id: "cortex", name: "Cortex", role: "Reasoning Core", theme: "Intent & action generation", color: "--agent-cortex", status: "idle", health: "healthy", updated_at: new Date().toISOString() },
  { id: "shield", name: "Shield", role: "Safety Barrier", theme: "Validation & risk", color: "--agent-shield", status: "idle", health: "healthy", updated_at: new Date().toISOString() },
  { id: "gatekeeper", name: "Gatekeeper", role: "Approval Vault", theme: "Human-in-the-loop", color: "--agent-gatekeeper", status: "idle", health: "healthy", updated_at: new Date().toISOString() },
  { id: "forge", name: "Forge", role: "Execution Engine", theme: "Tool & command runner", color: "--agent-forge", status: "idle", health: "healthy", updated_at: new Date().toISOString() },
  { id: "oracle", name: "Oracle", role: "Voice Emitter", theme: "Spoken response", color: "--agent-oracle", status: "idle", health: "healthy", updated_at: new Date().toISOString() },
];

const INITIAL_SERVICES: ServiceState[] = [
  { id: "tuner", name: "Tuner", role: "Audio Calibration Deck", theme: "Microphone & devices", health: "healthy", summary: "MacBook Pro Mic · −18 dB · granted", recent: "device.switched → builtin", errors: 0, updated_at: new Date().toISOString() },
  { id: "memory", name: "Memory", role: "Context Vault", theme: "Namespaced records", health: "healthy", summary: "412 keys across 11 namespaces", recent: "agent.whisper.last_transcript updated", errors: 0, updated_at: new Date().toISOString() },
  { id: "watchtower", name: "Watchtower", role: "Surveillance Tower", theme: "Runtime telemetry", health: "healthy", summary: "All models reachable · 0 alerts", recent: "qwen3-4b heartbeat", errors: 0, updated_at: new Date().toISOString() },
  { id: "ledger", name: "Ledger", role: "Audit Archive", theme: "Permanent structured logs", health: "healthy", summary: "1,284 events · 23 runs today", recent: "evt_001 → route_selected", errors: 0, updated_at: new Date().toISOString() },
  { id: "skillbook", name: "Skillbook", role: "Capability Codex", theme: "Tools & permissions", health: "healthy", summary: "42 skills · 9 categories", recent: "skill.open_app registered", errors: 0, updated_at: new Date().toISOString() },
  { id: "chronos", name: "Chronos", role: "Temporal Scheduler", theme: "Timers & recurring jobs", health: "healthy", summary: "3 scheduled · 1 recurring", errors: 0, recent: "reminder.standup in 12m", updated_at: new Date().toISOString() },
  { id: "archivist", name: "Archivist", role: "Evolution Archive", theme: "Versions & upgrade history", health: "healthy", summary: "v0.9.0 · 4 changes since last release", recent: "Planner added in v0.9.0", errors: 0, updated_at: new Date().toISOString() },
];

const INITIAL_MEMORY: MemoryRecord[] = [
  { namespace: "agent.whisper", type: "memory", key: "last_transcript", value: "Open VS Code and show Qwen logs", updated_at: new Date().toISOString() },
  { namespace: "agent.cortex", type: "memory", key: "last_intent", value: { intent: "open_application", target: "vscode" }, updated_at: new Date().toISOString() },
  { namespace: "service.tuner", type: "memory", key: "selected_mic", value: "MacBook Pro Microphone", updated_at: new Date().toISOString() },
  { namespace: "config.voice", type: "memory", key: "voice", value: "Samantha", updated_at: new Date().toISOString() },
  { namespace: "user.preferences", type: "memory", key: "active_project", value: "friday-console", updated_at: new Date().toISOString() },
  { namespace: "agent.forge", type: "memory", key: "recent_files", value: ["~/dev/friday/main.rs", "~/dev/friday/agents/cortex.rs"], updated_at: new Date().toISOString() },
];

const INITIAL_WATCH: WatchtowerSnapshot = {
  rustpotter: "online",
  whisper_cpp: "online",
  apple_intel: "online",
  qwen_1_7b: "online",
  qwen_4b: "online",
  microphone: "MacBook Pro Microphone",
  terminal_runtime: "online",
  websocket: "connecting",
  cpu: 22,
  memory: 41,
  failures: [],
};

export interface FridayState {
  connected: boolean;
  agents: AgentState[];
  services: ServiceState[];
  events: RuntimeEvent[];
  memory: MemoryRecord[];
  watch: WatchtowerSnapshot;
  activeRunId?: string;
  selectedAgentId?: string;
  selectedServiceId?: string;
  activeModel: string;

  ingestEvent(e: RuntimeEvent): void;
  setConnected(c: boolean): void;
  setSelectedAgent(id?: string): void;
  setSelectedService(id?: string): void;
  setActiveRun(id?: string): void;
  upsertMemory(r: MemoryRecord): void;
  updateWatch(patch: Partial<WatchtowerSnapshot>): void;
  sendSafeCommand(cmd: SafeCommand, payload?: Record<string, unknown>): void;
  clearView(): void;
}

export const useFriday = create<FridayState>((set, get) => ({
  connected: false,
  agents: INITIAL_AGENTS,
  services: INITIAL_SERVICES,
  events: [],
  memory: INITIAL_MEMORY,
  watch: INITIAL_WATCH,
  selectedAgentId: "cortex",
  activeModel: "Qwen3-4B",

  ingestEvent(e) {
    set((s) => {
      if (s.events.some((x) => x.event_id === e.event_id)) return s;
      const events = [e, ...s.events].slice(0, EVENT_BUFFER);
      const agents = s.agents.map((a) =>
        a.id === e.source.toLowerCase()
          ? {
              ...a,
              status: (e.status as AgentState["status"]) ?? a.status,
              last_event: e.event_type,
              last_input: (e.data?.input as string) ?? a.last_input,
              last_output: (e.data?.output as string) ?? a.last_output,
              last_error: e.status === "error" ? e.message : a.last_error,
              run_id: e.run_id,
              updated_at: e.timestamp,
            }
          : a,
      );
      return { events, agents, activeRunId: e.run_id };
    });
  },
  setConnected(c) { set({ connected: c }); },
  setSelectedAgent(id) { set({ selectedAgentId: id, selectedServiceId: undefined }); },
  setSelectedService(id) { set({ selectedServiceId: id, selectedAgentId: undefined }); },
  setActiveRun(id) { set({ activeRunId: id }); },
  upsertMemory(r) {
    set((s) => {
      const idx = s.memory.findIndex((m) => m.namespace === r.namespace && m.key === r.key);
      const next = [...s.memory];
      if (idx >= 0) next[idx] = r;
      else next.unshift(r);
      return { memory: next };
    });
  },
  updateWatch(patch) { set((s) => ({ watch: { ...s.watch, ...patch } })); },
  sendSafeCommand(cmd, payload) {
    // Safe commands are emitted as console_command frames. Here we just log
    // them to the event stream so the UI can confirm the dispatch.
    const evt: RuntimeEvent = {
      event_id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      run_id: get().activeRunId ?? `run_${Date.now()}`,
      source: "Console",
      source_type: "system",
      event_type: `console_command.${cmd}`,
      status: "info",
      message: `Safe command dispatched: ${cmd}`,
      data: { command: cmd, payload, validated_by: "terminal-runtime Shield" },
      timestamp: new Date().toISOString(),
    };
    get().ingestEvent(evt);
  },
  clearView() { set({ events: [] }); },
}));