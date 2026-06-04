import type { AgentState } from "../types";

export function AgentVisual({ agent }: { agent: AgentState }) {
  const color = `var(${agent.color})`;
  switch (agent.id) {
    case "radar": return <RadarSweep color={color} active={agent.status === "listening"} />;
    case "whisper": return <Waveform color={color} active={agent.status === "transcribing"} />;
    case "switchboard": return <RoutingMatrix color={color} active={agent.status === "routing"} />;
    case "planner": return <PlannerGrid color={color} active={agent.status === "planning"} />;
    case "cortex": return <NeuralOrb color={color} active={agent.status === "reasoning"} />;
    case "shield": return <HexBarrier color={color} active={agent.status === "validating"} />;
    case "gatekeeper": return <Vault color={color} active={agent.status === "waiting_for_approval"} />;
    case "forge": return <ForgeSparks color={color} active={agent.status === "executing"} />;
    case "oracle": return <VoiceHalo color={color} active={agent.status === "speaking"} />;
    default: return null;
  }
}

function RadarSweep({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20">
      <defs>
        <radialGradient id="rd">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {[20, 32, 44].map((r) => (
        <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={color} strokeOpacity="0.25" />
      ))}
      <g style={{ transformOrigin: "50% 50%", animation: active ? "radar-sweep 2.2s linear infinite" : undefined }}>
        <path d="M50 50 L50 6 A44 44 0 0 1 92 56 Z" fill="url(#rd)" opacity="0.7" />
      </g>
      <circle cx="50" cy="50" r="3" fill={color} />
    </svg>
  );
}

function Waveform({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="flex h-20 w-24 items-end justify-center gap-[3px]">
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm"
          style={{
            height: `${30 + ((i * 13) % 60)}%`,
            background: color,
            boxShadow: `0 0 6px ${color}`,
            animation: active ? `waveform 0.${5 + (i % 5)}s ease-in-out ${i * 40}ms infinite` : undefined,
            opacity: active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

function RoutingMatrix({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-28">
      <g fill="none" stroke={color} strokeWidth="1.2" strokeOpacity="0.6">
        <path d="M10 40 C 40 40, 50 12, 110 12" />
        <path d="M10 40 C 40 40, 50 40, 110 40" strokeOpacity="0.9" style={active ? { strokeDasharray: 6, animation: "flow-dash 1s linear infinite" } : undefined} />
        <path d="M10 40 C 40 40, 50 68, 110 68" />
      </g>
      <circle cx="10" cy="40" r="3" fill={color} />
      {[12, 40, 68].map((y) => <circle key={y} cx="110" cy={y} r="2.5" fill={color} fillOpacity={y === 40 ? 1 : 0.4} />)}
    </svg>
  );
}

function PlannerGrid({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-28">
      <defs>
        <pattern id="pg" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 0 L12 0 L12 12" fill="none" stroke={color} strokeOpacity="0.2" />
        </pattern>
      </defs>
      <rect width="120" height="80" fill="url(#pg)" />
      {[{x:10,y:18},{x:50,y:38},{x:90,y:58}].map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width="22" height="14" rx="2" fill={color} fillOpacity="0.25" stroke={color} />
        </g>
      ))}
      <path d="M32 25 L50 45 M72 45 L90 65" stroke={color} strokeWidth="1.2" fill="none" strokeOpacity={active ? 1 : 0.5} />
    </svg>
  );
}

function NeuralOrb({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20">
      <defs>
        <radialGradient id="no">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="60%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="28" fill="url(#no)" style={{ animation: active ? "orb-pulse 2.4s ease-in-out infinite" : undefined }} />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const x = (50 + 36 * Math.cos((a * Math.PI) / 180)).toFixed(3);
        const y = (50 + 36 * Math.sin((a * Math.PI) / 180)).toFixed(3);
        return <g key={a}>
          <line x1="50" y1="50" x2={x} y2={y} stroke={color} strokeOpacity="0.3" />
          <circle cx={x} cy={y} r="2" fill={color} />
        </g>;
      })}
    </svg>
  );
}

function HexBarrier({ color, active }: { color: string; active: boolean }) {
  const hex = (cx: number, cy: number, r: number) => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
    }
    return pts.join(" ");
  };
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20">
      {[34, 26, 18].map((r, i) => (
        <polygon key={r} points={hex(50, 50, r)} fill="none" stroke={color} strokeOpacity={0.3 + i * 0.2} style={active ? { animation: `orb-pulse ${1.4 + i * 0.3}s ease-in-out infinite` } : undefined} />
      ))}
      <polygon points={hex(50, 50, 10)} fill={color} fillOpacity="0.3" stroke={color} />
    </svg>
  );
}

function Vault({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20">
      <rect x="22" y="32" width="56" height="50" rx="4" fill="none" stroke={color} strokeOpacity="0.7" />
      <path d="M32 32 V22 a18 18 0 0 1 36 0 V32" fill="none" stroke={color} strokeOpacity={active ? 1 : 0.5} style={active ? { animation: "flicker 1.2s ease-in-out infinite" } : undefined} />
      <circle cx="50" cy="56" r="6" fill={color} fillOpacity="0.5" stroke={color} />
      <line x1="50" y1="60" x2="50" y2="72" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function ForgeSparks({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20">
      <defs>
        <radialGradient id="fg">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="60" r="22" fill="url(#fg)" style={{ animation: active ? "orb-pulse 1.4s ease-in-out infinite" : undefined }} />
      {[10, 30, 50, 70, 90].map((x, i) => (
        <line key={x} x1={x} y1="90" x2={x} y2={70 - (i % 2) * 8} stroke={color} strokeOpacity="0.6" />
      ))}
    </svg>
  );
}

function VoiceHalo({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20">
      {[14, 22, 30].map((r, i) => (
        <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={color} strokeOpacity={0.8 - i * 0.2} style={active ? { animation: `orb-pulse ${1.4 + i * 0.4}s ease-in-out infinite` } : undefined} />
      ))}
      <circle cx="50" cy="50" r="6" fill={color} />
    </svg>
  );
}