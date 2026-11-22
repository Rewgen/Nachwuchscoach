// Datenmodell der Übungssammlung. Die Übungen sind fest im Code hinterlegt
// (lib/uebungen), Favoriten und Merkliste liegen im localStorage (lib/speicher.tsx).

export type Stundenteil = "aufwaermen" | "hauptteil" | "abschluss";

export type Schwerpunkt =
  | "sprint"
  | "huerden"
  | "sprung"
  | "wurf"
  | "ausdauer"
  | "koordination"
  | "kraeftigung";

export type Form = "spiel" | "staffel" | "parcours" | "technik" | "wettkampf";

export type Ort = "drinnen" | "draussen" | "beides";

/** 1 = ruhig, 2 = mittel, 3 = intensiv */
export type Intensitaet = 1 | 2 | 3;

export type Punkt = [number, number];

/** Bausteine der Aufbau-Skizze; Koordinaten im Raster 320 × 200. */
export type SkizzenElement =
  | { t: "kind"; p: Punkt; team?: 0 | 1 | 2 | 3 }
  | { t: "trainer"; p: Punkt }
  | { t: "huetchen"; p: Punkt; farbe?: 0 | 1 | 2 | 3 }
  | { t: "weg"; pfad: Punkt[]; art?: "lauf" | "sprint" | "locker" | "sprung" | "wurf" }
  | { t: "linie"; a: Punkt; b: Punkt; art?: "start" | "markierung" }
  | { t: "reifen"; p: Punkt }
  | { t: "ball"; p: Punkt; gross?: boolean }
  | { t: "huerde"; p: Punkt }
  | {
      t: "flaeche";
      p: Punkt;
      w: number;
      h: number;
      art: "matte" | "sand" | "zone" | "kasten" | "weichboden";
      text?: string;
    }
  | { t: "bank"; a: Punkt; b: Punkt }
  | { t: "leiter"; a: Punkt; b: Punkt }
  | { t: "seil"; pfad: Punkt[] }
  | { t: "text"; p: Punkt; s: string };

export interface Uebung {
  id: string;
  titel: string;
  /** Ein Satz für die Karte. */
  kurz: string;
  stundenteil: Stundenteil;
  schwerpunkte: Schwerpunkt[];
  form: Form;
  ort: Ort;
  alterVon: number;
  alterBis: number;
  gruppeMin: number;
  /** Ungefähre Dauer in Minuten. */
  dauer: number;
  intensitaet: Intensitaet;
  /** Benötigtes Material (leer = ohne Material machbar). */
  material: string[];
  ziel: string;
  aufbau: string;
  ablauf: string[];
  tipps: string[];
  variationen: string[];
  skizze: SkizzenElement[];
}

export interface MerkEintrag {
  id: string;
  erledigt: boolean;
}
