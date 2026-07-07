import type {
  Anlage,
  Disziplin,
  Training,
  TrainingsEintrag,
  Uebung,
} from "./types";

// Regelbasierter Trainingsgenerator: baut aus der Übungsdatenbank einen
// Vorschlag (Aufwärmen → Hauptteil → Staffel → Abschluss), der zu den
// Rahmenbedingungen passt. Bewertungen aus dem Trainingslog fließen ein.

export interface GeneratorVorgaben {
  dauer: number; // Zielminuten gesamt
  schwerpunkt: Disziplin | "";
  ort: "drinnen" | "draussen" | "";
  anlagenVorhanden: Record<Anlage, boolean>;
  alter: number | null;
  gruppe: number | null;
  mitKennenlernspiel: boolean;
}

interface Bewertet {
  uebung: Uebung;
  punkte: number;
}

function passt(u: Uebung, v: GeneratorVorgaben): boolean {
  if (v.ort && u.ort !== "beides" && u.ort !== v.ort) return false;
  if (u.anlagen.some((a) => !v.anlagenVorhanden[a])) return false;
  if (v.alter !== null && (v.alter < u.altersVon || v.alter > u.altersBis)) return false;
  if (v.gruppe !== null) {
    if (v.gruppe < u.gruppeMin) return false;
    if (u.gruppeMax !== null && v.gruppe > u.gruppeMax) return false;
  }
  return true;
}

/** Punktzahl: Favoriten und gut bewertete Übungen bevorzugen, Zufall drüber. */
function bewerten(u: Uebung, trainings: Training[], schwerpunkt: Disziplin | ""): number {
  let punkte = Math.random() * 3;
  if (u.favorit) punkte += 2;
  if (schwerpunkt && u.disziplinen.includes(schwerpunkt)) punkte += 2.5;
  for (const t of trainings) {
    for (const e of t.eintraege) {
      if (e.uebungId !== u.id) continue;
      if (e.bewertung === "gut") punkte += 1;
      if (e.bewertung === "schlecht") punkte -= 2;
    }
  }
  return punkte;
}

function beste(pool: Bewertet[], anzahl: number, ausgeschlossen: Set<string>): Uebung[] {
  return pool
    .filter((b) => !ausgeschlossen.has(b.uebung.id))
    .sort((a, b) => b.punkte - a.punkte)
    .slice(0, anzahl)
    .map((b) => b.uebung);
}

export function trainingGenerieren(
  uebungen: Uebung[],
  trainings: Training[],
  vorgaben: GeneratorVorgaben
): TrainingsEintrag[] {
  const pool: Bewertet[] = uebungen
    .filter((u) => passt(u, vorgaben))
    .map((u) => ({ uebung: u, punkte: bewerten(u, trainings, vorgaben.schwerpunkt) }));

  const proAbschnitt = (abschnitt: Uebung["abschnitt"], disziplin?: Disziplin | "") =>
    pool.filter(
      (b) =>
        b.uebung.abschnitt === abschnitt &&
        (!disziplin || b.uebung.disziplinen.includes(disziplin))
    );

  const gewaehlt: Uebung[] = [];
  const drin = new Set<string>();
  const nimm = (kandidaten: Bewertet[], anzahl: number) => {
    for (const u of beste(kandidaten, anzahl, drin)) {
      gewaehlt.push(u);
      drin.add(u.id);
    }
  };

  // Kennenlernspiel (optional) und Aufwärmen
  if (vorgaben.mitKennenlernspiel) nimm(proAbschnitt("kennenlernen"), 1);
  nimm(proAbschnitt("aufwaermen"), 1);

  // Hauptteil: erst Schwerpunkt, dann auffüllen, bis die Zielzeit ungefähr steht.
  const reserviert = () =>
    gewaehlt.reduce((s, u) => s + u.dauer, 0) + 10 + 5; // + Staffel-Schätzung + Abschluss
  nimm(proAbschnitt("hauptteil", vorgaben.schwerpunkt), 2);
  let sicherung = 0;
  while (reserviert() < vorgaben.dauer - 8 && sicherung < 4) {
    const vorher = gewaehlt.length;
    nimm(proAbschnitt("hauptteil"), 1);
    if (gewaehlt.length === vorher) break; // Pool erschöpft
    sicherung++;
  }

  nimm(proAbschnitt("staffeln"), 1);
  nimm(proAbschnitt("abschluss"), 1);

  // Reihenfolge nach Abschnitt sortieren (Kennenlernen vor Aufwärmen ist ok).
  const ordnung = ["aufwaermen", "kennenlernen", "hauptteil", "staffeln", "abschluss"];
  gewaehlt.sort((a, b) => ordnung.indexOf(a.abschnitt) - ordnung.indexOf(b.abschnitt));

  return gewaehlt.map((u) => ({ uebungId: u.id, dauer: u.dauer }));
}
