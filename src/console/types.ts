export type AgentStatus =
  | "idle"
  | "listening"
  | "transcribing"
  | "routing"
  | "planning"
  | "reasoning"
  | "validating"
  | "waiting_for_approval"
  | "executing"
  | "speaking"
  | "success"
  | "warning"
  | "error"
  | "offline";

export type SourceType = "agent" | "service" | "module" | "system";

export interface RuntimeEvent {
  event_id: string;
  run_id: string;
  source: string;
  source_type: SourceType;
  event_type: string;
  status: AgentStatus | "success" | "error" | "warning" | "info";
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface MemoryRecord {
  namespace: string;
  type: "memory";
  key: string;
  value: unknown;
  updated_at: string;
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  theme: string;
  color: string; // css var name like --agent-radar
  status: AgentStatus;
  health: "healthy" | "degraded" | "offline";
  last_event?: string;
  last_input?: string;
  last_output?: string;
  last_error?: string;
  updated_at: string;
  run_id?: string;
}

export interface ServiceState {
  id: string;
  name: string;
  role: string;
  theme: string;
  health: "healthy" | "degraded" | "offline";
  summary: string;
  recent: string;
  errors: number;
  updated_at: string;
}

export interface WatchtowerSnapshot {
  rustpotter: "online" | "offline";
  whisper_cpp: "online" | "offline";
  apple_intel: "online" | "unavailable";
  qwen_1_7b: "online" | "offline";
  qwen_4b: "online" | "offline";
  microphone: string;
  terminal_runtime: "online" | "offline";
  websocket: "online" | "connecting" | "offline";
  cpu: number;
  memory: number;
  failures: { at: string; source: string; message: string }[];
}

export type SafeCommand =
  | "get_status"
  | "get_agents"
  | "get_services"
  | "get_memory"
  | "get_logs"
  | "get_run"
  | "start_listening"
  | "stop_listening"
  | "restart_wakeword"
  | "restart_whisper"
  | "start_model"
  | "stop_model"
  | "clear_console_view";

export const SAFE_COMMANDS: SafeCommand[] = [
  "get_status",
  "get_agents",
  "get_services",
  "get_memory",
  "get_logs",
  "get_run",
  "start_listening",
  "stop_listening",
  "restart_wakeword",
  "restart_whisper",
  "start_model",
  "stop_model",
  "clear_console_view",
];