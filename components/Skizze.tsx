import { useId } from "react";
import type { Punkt, SkizzenElement } from "@/lib/types";

const TEAM = ["#0284c7", "#f59e0b", "#059669", "#e11d48"];
const HUETCHEN = ["#f97316", "#0284c7", "#059669", "#eab308"];

const WEG_STIL = {
  lauf: { farbe: "#64748b", breite: 1.6, strich: undefined },
  sprint: { farbe: "#0369a1", breite: 2.2, strich: undefined },
  locker: { farbe: "#94a3b8", breite: 1.4, strich: "4 4" },
  sprung: { farbe: "#059669", breite: 1.6, strich: undefined },
  wurf: { farbe: "#d97706", breite: 1.6, strich: "2 3" },
} as const;

type WegArt = keyof typeof WEG_STIL;

/** Glatte Kurve durch alle Punkte (Catmull-Rom → Bézier). */
function glatt(p: Punkt[]): string {
  if (p.length < 3) return `M${p[0][0]},${p[0][1]} L${p[p.length - 1][0]},${p[p.length - 1][1]}`;
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** Bogen pro Sprung; lange Strecken werden in mehrere Sprünge geteilt. */
function boegen(p: Punkt[]): string {
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, ay] = p[i];
    const [bx, by] = p[i + 1];
    const laenge = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.round(laenge / 42));
    for (let k = 0; k < n; k++) {
      const sx = ax + ((bx - ax) * k) / n;
      const sy = ay + ((by - ay) * k) / n;
      const ex = ax + ((bx - ax) * (k + 1)) / n;
      const ey = ay + ((by - ay) * (k + 1)) / n;
      // Senkrechte zur Sprungrichtung, immer nach oben gewölbt.
      let px = ey - sy;
      let py = -(ex - sx);
      if (py > 0) {
        px = -px;
        py = -py;
      }
      const kx = (sx + ex) / 2 + px * 0.45;
      const ky = (sy + ey) / 2 + py * 0.45;
      d += ` Q${kx},${ky} ${ex},${ey}`;
    }
  }
  return d;
}

/** Wurfparabel: bei zwei Punkten nach oben gewölbt, sonst glatt durch alle Punkte. */
function parabel(p: Punkt[]): string {
  if (p.length > 2) return glatt(p);
  const [[ax, ay], [bx, by]] = p;
  const laenge = Math.hypot(bx - ax, by - ay);
  const kx = (ax + bx) / 2;
  const ky = (ay + by) / 2 - laenge * 0.3;
  return `M${ax},${ay} Q${kx},${ky} ${bx},${by}`;
}

function wegPfad(pfad: Punkt[], art: WegArt): string {
  if (art === "sprung") return boegen(pfad);
  if (art === "wurf") return parabel(pfad);
  return glatt(pfad);
}

const RANG: Record<SkizzenElement["t"], number> = {
  flaeche: 0,
  linie: 1,
  bank: 2,
  leiter: 2,
  seil: 3,
  reifen: 4,
  huerde: 5,
  weg: 6,
  huetchen: 7,
  ball: 8,
  kind: 9,
  trainer: 9,
  text: 10,
};

export default function Skizze({
  elemente,
  className = "",
  titel,
  viewBox = "0 0 320 200",
  rahmen = true,
}: {
  elemente: SkizzenElement[];
  className?: string;
  titel?: string;
  viewBox?: string;
  rahmen?: boolean;
}) {
  const basis = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sortiert = [...elemente].sort((a, b) => RANG[a.t] - RANG[b.t]);
  const genutzteArten = new Set(
    elemente.filter((e) => e.t === "weg").map((e) => (e as { art?: WegArt }).art ?? "lauf")
  );

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={rahmen ? "img" : undefined}
      aria-hidden={rahmen ? undefined : true}
      aria-label={rahmen ? (titel ? `Aufbau-Skizze: ${titel}` : "Aufbau-Skizze") : undefined}
    >
      <defs>
        {[...genutzteArten].map((art) => (
          <marker
            key={art}
            id={`${basis}-${art}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0,1 L9,5 L0,9 z" fill={WEG_STIL[art].farbe} />
          </marker>
        ))}
      </defs>
      {rahmen && <rect x="1" y="1" width="318" height="198" rx="6" fill="#f8fafc" stroke="#e2e8f0" />}
      {sortiert.map((e, i) => (
        <Element key={i} e={e} basis={basis} />
      ))}
    </svg>
  );
}

function Element({ e, basis }: { e: SkizzenElement; basis: string }) {
  switch (e.t) {
    case "kind":
      return (
        <circle cx={e.p[0]} cy={e.p[1]} r={6.5} fill={TEAM[e.team ?? 0]} stroke="#fff" strokeWidth={2} />
      );
    case "trainer":
      return (
        <g>
          <circle cx={e.p[0]} cy={e.p[1]} r={8} fill="#1e293b" stroke="#fff" strokeWidth={2} />
          <text
            x={e.p[0]}
            y={e.p[1] + 3.2}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill="#fff"
          >
            T
          </text>
        </g>
      );
    case "huetchen": {
      const [x, y] = e.p;
      return (
        <path
          d={`M${x},${y - 6} L${x + 5},${y + 4} L${x - 5},${y + 4} Z`}
          fill={HUETCHEN[e.farbe ?? 0]}
          stroke="#fff"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      );
    }
    case "weg": {
      const art = e.art ?? "lauf";
      const stil = WEG_STIL[art];
      return (
        <path
          d={wegPfad(e.pfad, art)}
          fill="none"
          stroke={stil.farbe}
          strokeWidth={stil.breite}
          strokeDasharray={stil.strich}
          strokeLinecap="round"
          markerEnd={`url(#${basis}-${art})`}
        />
      );
    }
    case "linie":
      return (
        <line
          x1={e.a[0]}
          y1={e.a[1]}
          x2={e.b[0]}
          y2={e.b[1]}
          stroke={e.art === "start" ? "#334155" : "#94a3b8"}
          strokeWidth={e.art === "start" ? 2 : 1.2}
          strokeDasharray={e.art === "start" ? undefined : "5 4"}
          strokeLinecap="round"
        />
      );
    case "reifen":
      return <circle cx={e.p[0]} cy={e.p[1]} r={10} fill="none" stroke="#db2777" strokeWidth={2.2} />;
    case "ball":
      return (
        <circle
          cx={e.p[0]}
          cy={e.p[1]}
          r={e.gross ? 7 : 3.8}
          fill="#fcd34d"
          stroke="#b45309"
          strokeWidth={1.2}
        />
      );
    case "huerde": {
      const [x, y] = e.p;
      return (
        <g stroke="#334155" strokeLinecap="round">
          <line x1={x} y1={y - 11} x2={x} y2={y + 11} strokeWidth={3} />
          <line x1={x - 4} y1={y - 11} x2={x + 1} y2={y - 11} strokeWidth={1.5} />
          <line x1={x - 4} y1={y + 11} x2={x + 1} y2={y + 11} strokeWidth={1.5} />
        </g>
      );
    }
    case "flaeche": {
      const stil = {
        matte: { fill: "#dbeafe", stroke: "#93c5fd", strich: undefined },
        weichboden: { fill: "#bfdbfe", stroke: "#60a5fa", strich: undefined },
        sand: { fill: "#fef3c7", stroke: "#fbbf24", strich: undefined },
        kasten: { fill: "#e7d8c3", stroke: "#a8865c", strich: undefined },
        zone: { fill: "#f1f5f9", stroke: "#94a3b8", strich: "4 3" },
      }[e.art];
      return (
        <g>
          <rect
            x={e.p[0]}
            y={e.p[1]}
            width={e.w}
            height={e.h}
            rx={3}
            fill={stil.fill}
            stroke={stil.stroke}
            strokeWidth={1.2}
            strokeDasharray={stil.strich}
          />
          {e.text && (
            <text
              x={e.p[0] + e.w / 2}
              y={e.p[1] + e.h / 2 + 3.5}
              textAnchor="middle"
              fontSize={9.5}
              fontWeight={500}
              fill="#475569"
            >
              {e.text}
            </text>
          )}
        </g>
      );
    }
    case "bank":
      return (
        <line
          x1={e.a[0]}
          y1={e.a[1]}
          x2={e.b[0]}
          y2={e.b[1]}
          stroke="#c8a97e"
          strokeWidth={9}
          strokeLinecap="round"
        />
      );
    case "leiter": {
      const [ax, ay] = e.a;
      const [bx, by] = e.b;
      const laenge = Math.hypot(bx - ax, by - ay);
      const nx = (-(by - ay) / laenge) * 8;
      const ny = ((bx - ax) / laenge) * 8;
      const sprossen = Math.max(2, Math.round(laenge / 15));
      return (
        <g stroke="#64748b" strokeWidth={1.4}>
          <line x1={ax + nx} y1={ay + ny} x2={bx + nx} y2={by + ny} />
          <line x1={ax - nx} y1={ay - ny} x2={bx - nx} y2={by - ny} />
          {Array.from({ length: sprossen + 1 }, (_, i) => {
            const x = ax + ((bx - ax) * i) / sprossen;
            const y = ay + ((by - ay) * i) / sprossen;
            return <line key={i} x1={x + nx} y1={y + ny} x2={x - nx} y2={y - ny} />;
          })}
        </g>
      );
    }
    case "seil":
      return (
        <path
          d={glatt(e.pfad)}
          fill="none"
          stroke="#a16207"
          strokeWidth={2}
          strokeLinecap="round"
        />
      );
    case "text":
      return (
        <text
          x={e.p[0]}
          y={e.p[1]}
          textAnchor="middle"
          fontSize={10}
          fontWeight={500}
          fill="#475569"
          stroke="#f8fafc"
          strokeWidth={3}
          paintOrder="stroke"
        >
          {e.s}
        </text>
      );
  }
}
