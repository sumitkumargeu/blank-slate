import { useFriday } from "./store";
import type { RuntimeEvent, SafeCommand } from "./types";

const DEFAULT_URL = "ws://127.0.0.1:8765";

let ws: WebSocket | null = null;
let reconnectDelay = 1000;
let manuallyClosed = false;

export function connectFridaySocket(url: string = DEFAULT_URL) {
  if (typeof window === "undefined") return;
  manuallyClosed = false;
  try {
    ws = new WebSocket(url);
  } catch {
    scheduleReconnect(url);
    return;
  }

  ws.onopen = () => {
    reconnectDelay = 1000;
    useFriday.getState().setConnected(true);
    useFriday.getState().updateWatch({ websocket: "online" });
  };

  ws.onmessage = (msg) => {
    try {
      const frame = JSON.parse(msg.data);
      if (frame?.type === "runtime_event" && frame.payload) {
        useFriday.getState().ingestEvent(frame.payload as RuntimeEvent);
      }
    } catch {
      /* ignore malformed frames */
    }
  };

  ws.onclose = () => {
    useFriday.getState().setConnected(false);
    useFriday.getState().updateWatch({ websocket: "offline" });
    if (!manuallyClosed) scheduleReconnect(url);
  };

  ws.onerror = () => ws?.close();
}

function scheduleReconnect(url: string) {
  useFriday.getState().updateWatch({ websocket: "connecting" });
  setTimeout(() => connectFridaySocket(url), reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, 15000);
}

export function disconnectFridaySocket() {
  manuallyClosed = true;
  ws?.close();
}

export function sendConsoleCommand(command: SafeCommand, payload?: Record<string, unknown>) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "console_command", command, payload }));
  }
  useFriday.getState().sendSafeCommand(command, payload);
}