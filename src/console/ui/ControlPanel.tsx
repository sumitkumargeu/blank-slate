import { SAFE_COMMANDS, type SafeCommand } from "../types";
import { sendConsoleCommand } from "../socket";

const LABELS: Record<SafeCommand, string> = {
  get_status: "Get Status",
  get_agents: "Get Agents",
  get_services: "Get Services",
  get_memory: "Get Memory",
  get_logs: "Get Logs",
  get_run: "Get Run",
  start_listening: "Start Listening",
  stop_listening: "Stop Listening",
  restart_wakeword: "Restart Wake Word",
  restart_whisper: "Restart Whisper",
  start_model: "Start Model",
  stop_model: "Stop Model",
  clear_console_view: "Clear Console View",
};

export function ControlPanel() {
  return (
    <section className="holo-panel overflow-hidden">
      <header className="border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Safe Control Panel</div>
            <div className="mt-0.5 font-mono text-sm text-foreground">Whitelisted Commands</div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-status-validating/40 bg-status-validating/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-status-validating">
            <span className="h-1.5 w-1.5 rounded-full bg-status-validating" style={{ boxShadow: "0 0 6px currentColor" }} />
            Validated by terminal runtime Shield before execution
          </div>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-3 xl:grid-cols-4">
        {SAFE_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => sendConsoleCommand(cmd)}
            className="group relative overflow-hidden rounded-md border border-white/10 bg-black/30 px-3 py-2 text-left transition-all hover:border-status-listening/40 hover:bg-status-listening/[0.06]"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-status-listening">{cmd}</div>
            <div className="mt-0.5 font-mono text-[12px] text-foreground/90">{LABELS[cmd]}</div>
            <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-status-listening/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>
      <div className="border-t border-white/5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Raw shell input disabled · Frontend cannot bypass Shield or Gatekeeper
      </div>
    </section>
  );
}