import type {
  Abschnitt,
  Anlage,
  Disziplin,
  Ort,
  UebungsBewertung,
} from "./types";

export const ABSCHNITTE: { wert: Abschnitt; label: string }[] = [
  { wert: "aufwaermen", label: "Aufwärmen" },
  { wert: "kennenlernen", label: "Kennenlernspiele" },
  { wert: "hauptteil", label: "Hauptteil" },
  { wert: "staffeln", label: "Staffeln" },
  { wert: "abschluss", label: "Abschluss" },
];

export const DISZIPLINEN: { wert: Disziplin; label: string }[] = [
  { wert: "sprint", label: "Sprint" },
  { wert: "sprung", label: "Sprung" },
  { wert: "wurf", label: "Wurf" },
  { wert: "ausdauer", label: "Ausdauer" },
  { wert: "koordination", label: "Koordination" },
];

export const ORTE: { wert: Ort; label: string }[] = [
  { wert: "drinnen", label: "Drinnen" },
  { wert: "draussen", label: "Draußen" },
  { wert: "beides", label: "Drinnen & Draußen" },
];

export const ANLAGEN: { wert: Anlage; label: string }[] = [
  { wert: "bahn400", label: "400m-Bahn" },
  { wert: "sprunggrube", label: "Sprunggrube" },
  { wert: "wurfanlage", label: "Wurfanlage" },
];

export const BEWERTUNGEN: { wert: UebungsBewertung; label: string }[] = [
  { wert: "gut", label: "Lief gut" },
  { wert: "mittel", label: "Ging so" },
  { wert: "schlecht", label: "Lief nicht" },
];

export function abschnittLabel(a: Abschnitt): string {
  return ABSCHNITTE.find((x) => x.wert === a)?.label ?? a;
}

export function disziplinLabel(d: Disziplin): string {
  return DISZIPLINEN.find((x) => x.wert === d)?.label ?? d;
}

export function ortLabel(o: Ort): string {
  return ORTE.find((x) => x.wert === o)?.label ?? o;
}

export function anlageLabel(a: Anlage): string {
  return ANLAGEN.find((x) => x.wert === a)?.label ?? a;
}

/** Gedeckte Badge-Farben je Trainingsabschnitt. */
export const ABSCHNITT_FARBEN: Record<Abschnitt, string> = {
  aufwaermen: "border-amber-200 bg-amber-50 text-amber-800",
  kennenlernen: "border-violet-200 bg-violet-50 text-violet-800",
  hauptteil: "border-sky-200 bg-sky-50 text-sky-800",
  staffeln: "border-emerald-200 bg-emerald-50 text-emerald-800",
  abschluss: "border-slate-200 bg-slate-100 text-slate-700",
};

export const MATERIAL_VORSCHLAEGE = [
  "Hütchen",
  "Leibchen",
  "Schlagbälle",
  "Softbälle",
  "Tennisbälle",
  "Medizinbälle",
  "Reifen",
  "Springseile",
  "Seil/Leine",
  "Koordinationsleiter",
  "Staffelstäbe",
  "Turnmatten",
  "Weichbodenmatte",
  "Langbänke",
  "Kastenteile/Kartons",
  "Wäscheklammern",
  "Schaumstoffwürfel",
  "Stoppuhr",
  "Maßband",
  "Kreide/Markierband",
];

/** Vorschläge für die Leistungserfassung. */
export const LEISTUNGS_DISZIPLINEN: { name: string; einheit: "s" | "min" | "m" | "Pkt." }[] = [
  { name: "30m Sprint", einheit: "s" },
  { name: "50m Sprint", einheit: "s" },
  { name: "100m Sprint", einheit: "s" },
  { name: "800m Lauf", einheit: "min" },
  { name: "Weitsprung", einheit: "m" },
  { name: "Zonenweitsprung", einheit: "Pkt." },
  { name: "Hochsprung", einheit: "m" },
  { name: "Schlagballwurf", einheit: "m" },
  { name: "Wurfball 200g", einheit: "m" },
  { name: "Medizinballstoß", einheit: "m" },
];

// ===== Formatierung =====

export function datumFormat(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length > 10 ? iso : iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function datumKurz(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length > 10 ? iso : iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function heuteISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const t = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${t}`;
}

export function altersText(von: number, bis: number): string {
  return `${von}–${bis} J.`;
}

export function gruppenText(min: number, max: number | null): string {
  return max ? `${min}–${max} Kinder` : `ab ${min} Kindern`;
}

/** Millisekunden als Stoppuhr-Anzeige, z. B. 1:23,45 */
export function msFormat(ms: number): string {
  const gesamtHundertstel = Math.floor(ms / 10);
  const hundertstel = gesamtHundertstel % 100;
  const sekunden = Math.floor(gesamtHundertstel / 100) % 60;
  const minuten = Math.floor(gesamtHundertstel / 6000);
  const s = String(sekunden).padStart(2, "0");
  const h = String(hundertstel).padStart(2, "0");
  return minuten > 0 ? `${minuten}:${s},${h}` : `${sekunden},${h}`;
}

/** Leistungswert lesbar machen (Zeit in min als m:ss). */
export function leistungFormat(wert: number, einheit: string): string {
  if (einheit === "min") {
    const m = Math.floor(wert / 60);
    const s = Math.round(wert % 60);
    return `${m}:${String(s).padStart(2, "0")} min`;
  }
  if (einheit === "s") return `${wert.toLocaleString("de-DE", { maximumFractionDigits: 2 })} s`;
  if (einheit === "m") return `${wert.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m`;
  return `${wert.toLocaleString("de-DE", { maximumFractionDigits: 1 })} ${einheit}`;
}

/** Alter in Jahren am heutigen Tag. */
export function alterHeute(geburtsdatum?: string): number | null {
  if (!geburtsdatum) return null;
  const geb = new Date(geburtsdatum + "T00:00:00");
  if (isNaN(geb.getTime())) return null;
  const heute = new Date();
  let alter = heute.getFullYear() - geb.getFullYear();
  const nochNichtGehabt =
    heute.getMonth() < geb.getMonth() ||
    (heute.getMonth() === geb.getMonth() && heute.getDate() < geb.getDate());
  if (nochNichtGehabt) alter--;
  return alter;
}

/** Tage bis zum nächsten Geburtstag (0 = heute). */
export function tageBisGeburtstag(geburtsdatum?: string): number | null {
  if (!geburtsdatum) return null;
  const geb = new Date(geburtsdatum + "T00:00:00");
  if (isNaN(geb.getTime())) return null;
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const naechster = new Date(heute.getFullYear(), geb.getMonth(), geb.getDate());
  if (naechster < heute) naechster.setFullYear(heute.getFullYear() + 1);
  return Math.round((naechster.getTime() - heute.getTime()) / 86400000);
}
