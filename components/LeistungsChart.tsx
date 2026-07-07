"use client";

import { datumKurz, leistungFormat } from "@/lib/labels";

interface Punkt {
  datum: string; // YYYY-MM-DD
  wert: number;
}

/**
 * Leichtes SVG-Liniendiagramm für die Leistungsentwicklung.
 * Bei Zeiten (s/min) ist kleiner besser – die Y-Achse wird dann gespiegelt,
 * sodass "besser" immer oben ist.
 */
export default function LeistungsChart({
  punkte,
  einheit,
}: {
  punkte: Punkt[];
  einheit: string;
}) {
  const sortiert = [...punkte].sort((a, b) => a.datum.localeCompare(b.datum));
  if (sortiert.length === 0) return null;

  const breite = 560;
  const hoehe = 180;
  const rand = { links: 8, rechts: 8, oben: 14, unten: 22 };

  const werte = sortiert.map((p) => p.wert);
  let min = Math.min(...werte);
  let max = Math.max(...werte);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const spanne = max - min;
  min -= spanne * 0.1;
  max += spanne * 0.1;

  const kleinerBesser = einheit === "s" || einheit === "min";

  const x = (i: number) =>
    sortiert.length === 1
      ? breite / 2
      : rand.links + (i / (sortiert.length - 1)) * (breite - rand.links - rand.rechts);
  const y = (wert: number) => {
    const anteil = (wert - min) / (max - min);
    const normiert = kleinerBesser ? anteil : 1 - anteil;
    return rand.oben + normiert * (hoehe - rand.oben - rand.unten);
  };

  const pfad = sortiert
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.wert).toFixed(1)}`)
    .join(" ");

  const letzter = sortiert[sortiert.length - 1];
  const bester = kleinerBesser
    ? sortiert.reduce((a, b) => (b.wert < a.wert ? b : a))
    : sortiert.reduce((a, b) => (b.wert > a.wert ? b : a));

  return (
    <div>
      <svg
        viewBox={`0 0 ${breite} ${hoehe}`}
        className="w-full"
        role="img"
        aria-label="Leistungsentwicklung"
      >
        {/* Gitterlinien */}
        {[0.25, 0.5, 0.75].map((a) => (
          <line
            key={a}
            x1={rand.links}
            x2={breite - rand.rechts}
            y1={rand.oben + a * (hoehe - rand.oben - rand.unten)}
            y2={rand.oben + a * (hoehe - rand.oben - rand.unten)}
            stroke="#e2e8f0"
            strokeDasharray="3 4"
          />
        ))}
        <path d={pfad} fill="none" stroke="#0369a1" strokeWidth={2} />
        {sortiert.map((p, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(p.wert)}
              r={p === bester ? 4.5 : 3.5}
              fill={p === bester ? "#059669" : "#0369a1"}
              stroke="#fff"
              strokeWidth={1.5}
            >
              <title>
                {datumKurz(p.datum)}: {leistungFormat(p.wert, einheit)}
              </title>
            </circle>
            <text
              x={x(i)}
              y={hoehe - 6}
              textAnchor={i === 0 ? "start" : i === sortiert.length - 1 ? "end" : "middle"}
              className="fill-slate-400"
              fontSize={10}
            >
              {datumKurz(p.datum)}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-xs text-slate-500">
        Bestwert:{" "}
        <span className="font-medium text-emerald-700">
          {leistungFormat(bester.wert, einheit)}
        </span>{" "}
        ({datumKurz(bester.datum)}) · Zuletzt: {leistungFormat(letzter.wert, einheit)} (
        {datumKurz(letzter.datum)})
        {kleinerBesser && " · kleinere Werte sind besser"}
      </p>
    </div>
  );
}
