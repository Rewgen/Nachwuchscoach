import type { ReactElement } from "react";

// Element-Katalog des Hallen-/Platzplaners. Jedes Element wird zentriert um
// (0,0) gezeichnet und per SVG-Transform positioniert/rotiert/skaliert.

export interface ElementDefinition {
  typ: string;
  label: string;
  /** true = zählt zur konfigurierbaren Material-Ausstattung */
  material: boolean;
  breite: number;
  hoehe: number;
  render: () => ReactElement;
}

export const PLAN_ELEMENTE: ElementDefinition[] = [
  {
    typ: "huetchen",
    label: "Hütchen",
    material: true,
    breite: 26,
    hoehe: 24,
    render: () => (
      <g>
        <path d="M -12 11 L 0 -11 L 12 11 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
        <path d="M -6 0 L 6 0" stroke="#fff" strokeWidth="3" />
        <rect x="-13" y="10" width="26" height="3" rx="1.5" fill="#c2410c" />
      </g>
    ),
  },
  {
    typ: "reifen",
    label: "Reifen",
    material: true,
    breite: 32,
    hoehe: 32,
    render: () => <circle r="14" fill="none" stroke="#dc2626" strokeWidth="5" />,
  },
  {
    typ: "ball",
    label: "Ball",
    material: true,
    breite: 20,
    hoehe: 20,
    render: () => (
      <g>
        <circle r="9" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
        <path d="M -9 0 A 9 9 0 0 1 9 0" fill="none" stroke="#a16207" strokeWidth="1" />
      </g>
    ),
  },
  {
    typ: "medizinball",
    label: "Medizinball",
    material: true,
    breite: 24,
    hoehe: 24,
    render: () => (
      <g>
        <circle r="11" fill="#166534" stroke="#052e16" strokeWidth="1.5" />
        <path d="M -11 0 H 11 M 0 -11 V 11" stroke="#052e16" strokeWidth="1" />
      </g>
    ),
  },
  {
    typ: "matte",
    label: "Turnmatte",
    material: true,
    breite: 64,
    hoehe: 40,
    render: () => (
      <rect x="-30" y="-18" width="60" height="36" rx="5" fill="#93c5fd" stroke="#2563eb" strokeWidth="2" />
    ),
  },
  {
    typ: "weichboden",
    label: "Weichbodenmatte",
    material: true,
    breite: 96,
    hoehe: 64,
    render: () => (
      <g>
        <rect x="-45" y="-30" width="90" height="60" rx="6" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2.5" />
        <rect x="-45" y="18" width="90" height="12" rx="6" fill="#3b82f6" />
      </g>
    ),
  },
  {
    typ: "bank",
    label: "Langbank",
    material: true,
    breite: 94,
    hoehe: 18,
    render: () => (
      <g>
        <rect x="-45" y="-7" width="90" height="14" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
        <path d="M -32 -7 V 7 M 32 -7 V 7" stroke="#78350f" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    typ: "kasten",
    label: "Sprungkasten",
    material: true,
    breite: 48,
    hoehe: 34,
    render: () => (
      <g>
        <rect x="-22" y="-15" width="44" height="30" rx="3" fill="#d6bb8a" stroke="#8a6d3b" strokeWidth="1.5" />
        <path d="M -22 -5 H 22 M -22 5 H 22" stroke="#8a6d3b" strokeWidth="1" />
      </g>
    ),
  },
  {
    typ: "huerde",
    label: "Hürde",
    material: true,
    breite: 44,
    hoehe: 22,
    render: () => (
      <g>
        <rect x="-20" y="-9" width="40" height="7" rx="2" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M -17 -2 V 10 M 17 -2 V 10" stroke="#0f172a" strokeWidth="2.5" />
      </g>
    ),
  },
  {
    typ: "leiter",
    label: "Koordinationsleiter",
    material: true,
    breite: 104,
    hoehe: 24,
    render: () => (
      <g stroke="#eab308" strokeWidth="2.5" fill="none">
        <path d="M -50 -10 H 50 M -50 10 H 50" />
        {[-50, -30, -10, 10, 30, 50].map((x) => (
          <path key={x} d={`M ${x} -10 V 10`} />
        ))}
      </g>
    ),
  },
  {
    typ: "seil",
    label: "Seil",
    material: true,
    breite: 84,
    hoehe: 16,
    render: () => (
      <path
        d="M -40 0 C -30 -8, -20 8, -10 0 S 10 -8, 20 0 S 40 8, 40 0"
        fill="none"
        stroke="#9333ea"
        strokeWidth="3"
        strokeLinecap="round"
      />
    ),
  },
  {
    typ: "slalomstange",
    label: "Slalomstange",
    material: true,
    breite: 14,
    hoehe: 14,
    render: () => (
      <g>
        <circle r="5.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
        <circle r="1.8" fill="#fff" />
      </g>
    ),
  },
  {
    typ: "zauberschnur",
    label: "Zauberschnur",
    material: true,
    breite: 104,
    hoehe: 18,
    render: () => (
      <g>
        <circle cx="-48" r="5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
        <circle cx="48" r="5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
        <path d="M -43 0 H 43" stroke="#0f172a" strokeWidth="2" strokeDasharray="6 4" />
      </g>
    ),
  },
  {
    typ: "kind",
    label: "Kind",
    material: false,
    breite: 20,
    hoehe: 20,
    render: () => (
      <g>
        <circle r="9" fill="#0284c7" />
        <circle cy="-2.5" r="3.2" fill="#fff" />
        <path d="M -4.5 5.5 A 4.5 4.5 0 0 1 4.5 5.5 Z" fill="#fff" />
      </g>
    ),
  },
  {
    typ: "trainer",
    label: "Trainer",
    material: false,
    breite: 20,
    hoehe: 20,
    render: () => (
      <g>
        <circle r="9" fill="#0f172a" />
        <circle cy="-2.5" r="3.2" fill="#fbbf24" />
        <path d="M -4.5 5.5 A 4.5 4.5 0 0 1 4.5 5.5 Z" fill="#fbbf24" />
      </g>
    ),
  },
  {
    typ: "pfeil",
    label: "Laufweg-Pfeil",
    material: false,
    breite: 70,
    hoehe: 18,
    render: () => (
      <g stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M -32 0 H 24" strokeDasharray="8 5" />
        <path d="M 20 -7 L 32 0 L 20 7" fill="#0f172a" stroke="none" />
      </g>
    ),
  },
  {
    typ: "text",
    label: "Text",
    material: false,
    breite: 60,
    hoehe: 20,
    render: () => (
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="15"
        fontWeight="700"
        fill="#0f172a"
      >
        Abc
      </text>
    ),
  },
];

export const ELEMENT_MAP = new Map(PLAN_ELEMENTE.map((e) => [e.typ, e]));

/** Alle Elementtypen, die als "Material" konfigurierbar sind. */
export const MATERIAL_ELEMENTE = PLAN_ELEMENTE.filter((e) => e.material);
