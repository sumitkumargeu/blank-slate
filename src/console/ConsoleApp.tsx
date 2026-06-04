import { useEffect } from "react";
import { useFriday } from "./store";
import { startMockRuntime } from "./mockRuntime";
import { connectFridaySocket } from "./socket";
import { TopBar } from "./ui/TopBar";
import { Sidebar } from "./ui/Sidebar";
import { AgentGraph } from "./ui/AgentGraph";
import { ServiceGrid } from "./ui/ServiceGrid";
import { Inspector } from "./ui/Inspector";
import { BottomDrawer } from "./ui/BottomDrawer";
import { WatchtowerPanel } from "./ui/WatchtowerPanel";
import { ControlPanel } from "./ui/ControlPanel";

export function ConsoleApp() {
  useEffect(() => {
    // Try the real terminal runtime; fall back to the mock generator if no
    // events arrive within the grace window.
    connectFridaySocket();
    const t = setTimeout(() => {
      if (useFriday.getState().events.length === 0) startMockRuntime();
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-screen min-h-screen w-screen flex-col gap-3 overflow-hidden p-3">
      <TopBar />
      <div className="flex min-h-0 flex-1 gap-3">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex min-h-0 flex-1 gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
              <AgentGraph />
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                <div className="xl:col-span-2"><ServiceGrid /></div>
                <WatchtowerPanel />
              </div>
              <ControlPanel />
            </div>
            <Inspector />
          </div>
          <BottomDrawer />
        </main>
      </div>
    </div>
  );
}