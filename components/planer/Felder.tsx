import type { PlatzTyp } from "@/lib/types";

export const PLATZ_NAMEN: Record<PlatzTyp, string> = {
  halle: "Sporthalle",
  tartanplatz: "Tartanplatz",
  bahn400: "400m-Bahn mit Rasenanlage",
};

export const PLATZ_ORT: Record<PlatzTyp, "drinnen" | "draussen"> = {
  halle: "drinnen",
  tartanplatz: "draussen",
  bahn400: "draussen",
};

/** Spielfeld-Hintergründe im 1000×600-Raster. */
export default function FeldHintergrund({ typ }: { typ: PlatzTyp }) {
  if (typ === "halle") return <Halle />;
  if (typ === "tartanplatz") return <Tartanplatz />;
  return <Bahn400 />;
}

function Halle() {
  return (
    <g>
      {/* Hallenboden */}
      <rect x="0" y="0" width="1000" height="600" fill="#f3e3c3" />
      {/* Parkett-Andeutung */}
      {Array.from({ length: 19 }).map((_, i) => (
        <line
          key={i}
          x1={(i + 1) * 50}
          y1="0"
          x2={(i + 1) * 50}
          y2="600"
          stroke="#e4cfa4"
          strokeWidth="1"
        />
      ))}
      {/* Spielfeldlinien */}
      <rect x="60" y="60" width="880" height="480" fill="none" stroke="#1d4ed8" strokeWidth="4" />
      <line x1="500" y1="60" x2="500" y2="540" stroke="#1d4ed8" strokeWidth="3" />
      <circle cx="500" cy="300" r="70" fill="none" stroke="#1d4ed8" strokeWidth="3" />
      {/* Zonen (Basketball-Körbe angedeutet) */}
      <path d="M 60 190 H 200 V 410 H 60" fill="none" stroke="#dc2626" strokeWidth="3" />
      <path d="M 940 190 H 800 V 410 H 940" fill="none" stroke="#dc2626" strokeWidth="3" />
      {/* Volleyball-Angriffslinien */}
      <line x1="380" y1="60" x2="380" y2="540" stroke="#059669" strokeWidth="2" strokeDasharray="12 8" />
      <line x1="620" y1="60" x2="620" y2="540" stroke="#059669" strokeWidth="2" strokeDasharray="12 8" />
      {/* Wand */}
      <rect x="0" y="0" width="1000" height="600" fill="none" stroke="#8a6d3b" strokeWidth="8" />
    </g>
  );
}

function Tartanplatz() {
  const bahnHoehe = 75;
  return (
    <g>
      {/* Umgebung (Rasenstreifen) */}
      <rect x="0" y="0" width="1000" height="600" fill="#5a9e58" />
      {/* Tartanfläche */}
      <rect x="0" y="45" width="1000" height={bahnHoehe * 6 + 30} fill="#b5493d" />
      {/* Bahnlinien */}
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={i}
          x1="0"
          y1={60 + i * bahnHoehe}
          x2="1000"
          y2={60 + i * bahnHoehe}
          stroke="#fff"
          strokeWidth="3"
        />
      ))}
      {/* Startlinie + Ziellinie */}
      <line x1="60" y1="60" x2="60" y2={60 + 6 * bahnHoehe} stroke="#fff" strokeWidth="8" />
      <line x1="940" y1="60" x2="940" y2={60 + 6 * bahnHoehe} stroke="#fff" strokeWidth="4" strokeDasharray="10 6" />
      {/* Bahnnummern */}
      {Array.from({ length: 6 }).map((_, i) => (
        <text
          key={i}
          x="30"
          y={60 + i * bahnHoehe + bahnHoehe / 2 + 7}
          fill="#fff"
          fontSize="24"
          fontWeight="700"
          textAnchor="middle"
        >
          {i + 1}
        </text>
      ))}
    </g>
  );
}

function Bahn400() {
  // Ovale Bahn mit Rasen-Innenraum, Sprunggrube und Wurfsektor.
  const lanes = 4;
  return (
    <g>
      <rect x="0" y="0" width="1000" height="600" fill="#5a9e58" />
      {/* Tartan-Oval */}
      <ellipse cx="500" cy="300" rx="470" ry="270" fill="#b5493d" />
      <ellipse cx="500" cy="300" rx="340" ry="160" fill="#4d9e4d" />
      {/* Bahnlinien */}
      {Array.from({ length: lanes + 1 }).map((_, i) => {
        const rx = 340 + (i * (470 - 340)) / lanes;
        const ry = 160 + (i * (270 - 160)) / lanes;
        return (
          <ellipse
            key={i}
            cx="500"
            cy="300"
            rx={rx}
            ry={ry}
            fill="none"
            stroke="#fff"
            strokeWidth={i === 0 || i === lanes ? 3 : 2}
          />
        );
      })}
      {/* Ziellinie */}
      <line x1="500" y1="460" x2="500" y2="570" stroke="#fff" strokeWidth="6" />
      {/* Rasen-Anspielpunkte */}
      <circle cx="500" cy="300" r="4" fill="#e6f4e6" />
      {/* Sprunggrube (rechts im Innenraum) */}
      <rect x="620" y="250" width="150" height="20" fill="#c8b28b" stroke="#8a6d3b" strokeWidth="2" />
      <rect x="770" y="235" width="70" height="50" rx="6" fill="#e9d9ae" stroke="#8a6d3b" strokeWidth="2" />
      <text x="700" y="300" fontSize="14" fill="#1e3a1e" textAnchor="middle">
        Sprunggrube
      </text>
      {/* Wurfsektor (links im Innenraum) */}
      <circle cx="260" cy="300" r="16" fill="none" stroke="#fff" strokeWidth="2.5" />
      <path d="M 272 290 L 420 230 M 272 310 L 420 370" stroke="#fff" strokeWidth="2" strokeDasharray="8 6" />
      <text x="330" y="305" fontSize="14" fill="#e6f4e6" textAnchor="middle">
        Wurfanlage
      </text>
    </g>
  );
}
