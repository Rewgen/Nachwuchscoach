import type { Form, Intensitaet, Ort, Schwerpunkt, Stundenteil, Uebung } from "./types";
import { UEBUNGEN } from "./uebungen";

export const STUNDENTEILE: { wert: Stundenteil; label: string }[] = [
  { wert: "aufwaermen", label: "Aufwärmen" },
  { wert: "hauptteil", label: "Hauptteil" },
  { wert: "abschluss", label: "Abschluss" },
];

export const SCHWERPUNKTE: { wert: Schwerpunkt; label: string; farbe: string }[] = [
  { wert: "sprint", label: "Sprint", farbe: "bg-sky-600" },
  { wert: "huerden", label: "Hürden", farbe: "bg-indigo-500" },
  { wert: "sprung", label: "Sprung", farbe: "bg-emerald-600" },
  { wert: "wurf", label: "Wurf", farbe: "bg-amber-500" },
  { wert: "ausdauer", label: "Ausdauer", farbe: "bg-rose-500" },
  { wert: "koordination", label: "Koordination", farbe: "bg-violet-500" },
  { wert: "kraeftigung", label: "Kräftigung", farbe: "bg-slate-600" },
];

export const FORMEN: { wert: Form; label: string }[] = [
  { wert: "spiel", label: "Spiel" },
  { wert: "staffel", label: "Staffel" },
  { wert: "wettkampf", label: "Wettkampfform" },
  { wert: "technik", label: "Technikübung" },
  { wert: "parcours", label: "Parcours / Stationen" },
];

export const ORTE: { wert: Exclude<Ort, "beides">; label: string }[] = [
  { wert: "drinnen", label: "Halle" },
  { wert: "draussen", label: "Draußen" },
];

export const ALTERSKLASSEN = [
  { wert: "u8", label: "U8", von: 0, bis: 7 },
  { wert: "u10", label: "U10", von: 8, bis: 9 },
  { wert: "u12", label: "U12", von: 10, bis: 11 },
  { wert: "u14", label: "U14+", von: 12, bis: 99 },
] as const;
export type Altersklasse = (typeof ALTERSKLASSEN)[number]["wert"];

export const DAUERN = [
  { wert: "kurz", label: "bis 8 min", von: 0, bis: 8 },
  { wert: "mittel", label: "10–12 min", von: 9, bis: 12 },
  { wert: "lang", label: "15+ min", von: 13, bis: 999 },
] as const;
export type Dauerklasse = (typeof DAUERN)[number]["wert"];

export const INTENSITAET_LABEL: Record<Intensitaet, string> = {
  1: "ruhig",
  2: "mittel",
  3: "intensiv",
};

export const SORTIERUNGEN = [
  { wert: "stunde", label: "Stundenablauf" },
  { wert: "az", label: "A–Z" },
  { wert: "dauer", label: "Kürzeste zuerst" },
  { wert: "material", label: "Wenig Material zuerst" },
  { wert: "intensitaet", label: "Intensivste zuerst" },
] as const;
export type Sortierung = (typeof SORTIERUNGEN)[number]["wert"];

export const label = {
  stundenteil: (w: Stundenteil) => STUNDENTEILE.find((s) => s.wert === w)!.label,
  schwerpunkt: (w: Schwerpunkt) => SCHWERPUNKTE.find((s) => s.wert === w)!.label,
  form: (w: Form) => FORMEN.find((s) => s.wert === w)!.label,
  ort: (w: Ort) => (w === "beides" ? "Halle & draußen" : ORTE.find((o) => o.wert === w)!.label),
};

export const schwerpunktFarbe = (w: Schwerpunkt) =>
  SCHWERPUNKTE.find((s) => s.wert === w)!.farbe;

export const alterText = (u: Uebung) =>
  u.alterBis >= 18 ? `ab ${u.alterVon} J.` : `${u.alterVon}–${u.alterBis} J.`;

/** Alle Materialien, die im Katalog vorkommen, alphabetisch. */
export const ALLE_MATERIALIEN: string[] = [
  ...new Set(UEBUNGEN.flatMap((u) => u.material)),
].sort((a, b) => a.localeCompare(b, "de"));

export interface Filter {
  suche: string;
  stundenteile: Stundenteil[];
  schwerpunkte: Schwerpunkt[];
  altersklassen: Altersklasse[];
  orte: Exclude<Ort, "beides">[];
  formen: Form[];
  dauern: Dauerklasse[];
  ohneMaterial: boolean;
  nurFavoriten: boolean;
  sortierung: Sortierung;
}

export const LEERER_FILTER: Filter = {
  suche: "",
  stundenteile: [],
  schwerpunkte: [],
  altersklassen: [],
  orte: [],
  formen: [],
  dauern: [],
  ohneMaterial: false,
  nurFavoriten: false,
  sortierung: "stunde",
};

export function aktiveFilterAnzahl(f: Filter): number {
  return (
    f.stundenteile.length +
    f.schwerpunkte.length +
    f.altersklassen.length +
    f.orte.length +
    f.formen.length +
    f.dauern.length +
    (f.ohneMaterial ? 1 : 0) +
    (f.nurFavoriten ? 1 : 0)
  );
}

function normalisiere(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

const SUCHTEXT = new Map(
  UEBUNGEN.map((u) => [
    u.id,
    normalisiere(
      [
        u.titel,
        u.kurz,
        u.ziel,
        u.aufbau,
        ...u.ablauf,
        ...u.variationen,
        ...u.material,
        ...u.schwerpunkte.map(label.schwerpunkt),
        label.form(u.form),
        label.stundenteil(u.stundenteil),
      ].join(" ")
    ),
  ])
);

function trifftSuche(u: Uebung, suche: string): boolean {
  const woerter = normalisiere(suche).split(/\s+/).filter(Boolean);
  if (woerter.length === 0) return true;
  const text = SUCHTEXT.get(u.id)!;
  return woerter.every((w) => text.includes(w));
}

function trifftAlter(u: Uebung, klassen: Altersklasse[]): boolean {
  if (klassen.length === 0) return true;
  return klassen.some((k) => {
    const ak = ALTERSKLASSEN.find((a) => a.wert === k)!;
    return u.alterVon <= ak.bis && u.alterBis >= ak.von;
  });
}

function trifftDauer(u: Uebung, dauern: Dauerklasse[]): boolean {
  if (dauern.length === 0) return true;
  return dauern.some((d) => {
    const dk = DAUERN.find((x) => x.wert === d)!;
    return u.dauer >= dk.von && u.dauer <= dk.bis;
  });
}

const TEIL_REIHENFOLGE: Record<Stundenteil, number> = { aufwaermen: 0, hauptteil: 1, abschluss: 2 };

export function filtern(
  uebungen: Uebung[],
  f: Filter,
  favoriten: Set<string>,
  /** Materialien, die nicht vorhanden sind. */
  fehlendesMaterial: Set<string>
): Uebung[] {
  const treffer = uebungen.filter(
    (u) =>
      trifftSuche(u, f.suche) &&
      (f.stundenteile.length === 0 || f.stundenteile.includes(u.stundenteil)) &&
      (f.schwerpunkte.length === 0 || u.schwerpunkte.some((s) => f.schwerpunkte.includes(s))) &&
      (f.orte.length === 0 || u.ort === "beides" || f.orte.includes(u.ort)) &&
      (f.formen.length === 0 || f.formen.includes(u.form)) &&
      trifftAlter(u, f.altersklassen) &&
      trifftDauer(u, f.dauern) &&
      (!f.ohneMaterial || u.material.length === 0) &&
      u.material.every((m) => !fehlendesMaterial.has(m)) &&
      (!f.nurFavoriten || favoriten.has(u.id))
  );
  return sortieren(treffer, f.sortierung);
}

export function sortieren(liste: Uebung[], s: Sortierung): Uebung[] {
  const kopie = [...liste];
  const az = (a: Uebung, b: Uebung) => a.titel.localeCompare(b.titel, "de");
  switch (s) {
    case "az":
      return kopie.sort(az);
    case "dauer":
      return kopie.sort((a, b) => a.dauer - b.dauer || az(a, b));
    case "material":
      return kopie.sort((a, b) => a.material.length - b.material.length || az(a, b));
    case "intensitaet":
      return kopie.sort((a, b) => b.intensitaet - a.intensitaet || az(a, b));
    default:
      return kopie.sort(
        (a, b) => TEIL_REIHENFOLGE[a.stundenteil] - TEIL_REIHENFOLGE[b.stundenteil]
      );
  }
}

/** Übungen mit gleichem Schwerpunkt, für „Passt dazu“. */
export function aehnliche(u: Uebung, anzahl = 3): Uebung[] {
  return UEBUNGEN.filter((x) => x.id !== u.id)
    .map((x) => ({
      x,
      punkte:
        x.schwerpunkte.filter((s) => u.schwerpunkte.includes(s)).length * 2 +
        (x.stundenteil === u.stundenteil ? 1 : 0) +
        (x.form === u.form ? 1 : 0),
    }))
    .filter((e) => e.punkte > 1)
    .sort((a, b) => b.punkte - a.punkte || a.x.titel.localeCompare(b.x.titel, "de"))
    .slice(0, anzahl)
    .map((e) => e.x);
}

/** Gesamtliste des Materials für mehrere Übungen. */
export function materialliste(uebungen: Uebung[]): string[] {
  return [...new Set(uebungen.flatMap((u) => u.material))].sort((a, b) =>
    a.localeCompare(b, "de")
  );
}

export { TEIL_REIHENFOLGE };
