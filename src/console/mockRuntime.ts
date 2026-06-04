import type { RuntimeEvent } from "./types";
import { useFriday } from "./store";

const SAMPLE_TRANSCRIPTS = [
  "Open VS Code and show Qwen logs",
  "Start the 4B model and run the build",
  "Show me the last error in friday-core",
  "Schedule a standup reminder in 12 minutes",
  "Restart the wake word engine",
];

const ROUTES = ["qwen3-4b", "qwen3-1.7b", "apple-intelligence", "deterministic"];

function nowIso() { return new Date().toISOString(); }
function uid() { return Math.random().toString(36).slice(2, 9); }

async function runPipeline() {
  const { ingestEvent, upsertMemory } = useFriday.getState();
  const run_id = `run_${Date.now()}`;
  const transcript = SAMPLE_TRANSCRIPTS[Math.floor(Math.random() * SAMPLE_TRANSCRIPTS.length)];
  const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];

  const steps: Array<[string, RuntimeEvent]> = [
    ["radar", {
      event_id: `evt_${uid()}`, run_id, source: "Radar", source_type: "agent",
      event_type: "wake_detected", status: "listening",
      message: "Wake word matched", data: { confidence: 0.94 }, timestamp: nowIso(),
    }],
    ["whisper", {
      event_id: `evt_${uid()}`, run_id, source: "Whisper", source_type: "agent",
      event_type: "transcript_ready", status: "transcribing",
      message: "Speech transcribed", data: { transcript, input: "audio:48k/mono", output: transcript }, timestamp: nowIso(),
    }],
    ["switchboard", {
      event_id: `evt_${uid()}`, run_id, source: "Switchboard", source_type: "agent",
      event_type: "route_selected", status: "routing",
      message: `Routed to ${route}`, data: { route, reason: "multi-step terminal command", input: transcript, output: route }, timestamp: nowIso(),
    }],
    ["planner", {
      event_id: `evt_${uid()}`, run_id, source: "Planner", source_type: "agent",
      event_type: "plan_generated", status: "planning",
      message: "3-step plan ready",
      data: { steps: ["Open VS Code", "Start Qwen", "Show logs"], input: transcript, output: "plan:3-steps" },
      timestamp: nowIso(),
    }],
    ["cortex", {
      event_id: `evt_${uid()}`, run_id, source: "Cortex", source_type: "agent",
      event_type: "action_generated", status: "reasoning",
      message: "Structured action emitted",
      data: {
        intent: "open_application",
        tools: ["open_app", "tail_log"],
        parameters: { app: "Visual Studio Code", path: "~/dev/friday" },
        action: { tool: "open_app", args: { name: "Visual Studio Code" } },
        confidence: 0.87,
        input: transcript,
        output: "action:open_application",
      },
      timestamp: nowIso(),
    }],
    ["shield", {
      event_id: `evt_${uid()}`, run_id, source: "Shield", source_type: "agent",
      event_type: "validation_passed", status: "validating",
      message: "Action passed all safety checks", data: { risk: "low", checks: 6, blocked: 0 }, timestamp: nowIso(),
    }],
    ["gatekeeper", {
      event_id: `evt_${uid()}`, run_id, source: "Gatekeeper", source_type: "agent",
      event_type: "auto_approved", status: "waiting_for_approval",
      message: "Within auto-approve threshold", data: { policy: "low-risk:auto" }, timestamp: nowIso(),
    }],
    ["forge", {
      event_id: `evt_${uid()}`, run_id, source: "Forge", source_type: "agent",
      event_type: "execution_complete", status: "executing",
      message: "Tool executed successfully",
      data: { tool: "open_app", duration_ms: 412, output: "VS Code launched", input: "open_app:vscode" },
      timestamp: nowIso(),
    }],
    ["oracle", {
      event_id: `evt_${uid()}`, run_id, source: "Oracle", source_type: "agent",
      event_type: "spoken", status: "speaking",
      message: "Spoken via Samantha",
      data: { text: "VS Code is open. Showing Qwen logs.", voice: "Samantha", output: "speech:emitted" },
      timestamp: nowIso(),
    }],
  ];

  for (const [, evt] of steps) {
    ingestEvent(evt);
    await new Promise((r) => setTimeout(r, 550 + Math.random() * 350));
  }

  upsertMemory({
    namespace: "agent.whisper", type: "memory", key: "last_transcript",
    value: transcript, updated_at: nowIso(),
  });
}

let started = false;
export function startMockRuntime() {
  if (started) return;
  started = true;
  const tick = async () => {
    await runPipeline();
    setTimeout(tick, 4500 + Math.random() * 3000);
  };
  // light watchtower jitter
  setInterval(() => {
    const { updateWatch } = useFriday.getState();
    updateWatch({
      cpu: Math.max(8, Math.min(85, 22 + Math.round((Math.random() - 0.5) * 18))),
      memory: Math.max(20, Math.min(92, 41 + Math.round((Math.random() - 0.5) * 12))),
    });
  }, 1500);
  setTimeout(() => useFriday.getState().updateWatch({ websocket: "online" }), 800);
  setTimeout(() => useFriday.setState({ connected: true }), 800);
  tick();
}