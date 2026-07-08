// Zentrale Datentypen der App.
// Persistenz: Supabase (Postgres + Storage), Zugriff im Client
// ausschließlich über lib/store.tsx; Gäste speichern lokal (lib/offline.ts).

export type Abschnitt =
  | "aufwaermen"
  | "kennenlernen"
  | "hauptteil"
  | "staffeln"
  | "abschluss";

export type Disziplin =
  | "sprint"
  | "sprung"
  | "wurf"
  | "ausdauer"
  | "koordination";

export type Ort = "drinnen" | "draussen" | "beides";

/** Feste Anlagen, die eine Übung zwingend voraussetzt. */
export type Anlage = "bahn400" | "sprunggrube" | "wurfanlage";

export interface Uebung {
  id: string;
  titel: string;
  beschreibung: string;
  variationen?: string;
  abschnitt: Abschnitt;
  disziplinen: Disziplin[];
  ort: Ort;
  anlagen: Anlage[];
  /** Benötigtes Material (leer = ohne Material machbar). */
  material: string[];
  altersVon: number;
  altersBis: number;
  gruppeMin: number;
  gruppeMax: number | null;
  /** Ungefähre Dauer in Minuten. */
  dauer: number;
  favorit: boolean;
  eigene: boolean;
  erstelltAm: string;
}

/** Bild, Videodatei oder YouTube-Link zu einer Übung. */
export interface Medium {
  id: string;
  uebungId: string;
  typ: "bild" | "video" | "youtube";
  /** Dateiname im Upload-Ordner (bild/video). */
  dateiname?: string;
  /** YouTube-URL (typ youtube). */
  url?: string;
  beschriftung?: string;
  reihenfolge: number;
}

export type UebungsBewertung = "gut" | "mittel" | "schlecht";

export interface TrainingsEintrag {
  uebungId: string;
  dauer: number;
  notiz?: string;
  bewertung?: UebungsBewertung;
}

export interface Reflexion {
  gut: string;
  schlecht: string;
  naechstesMal: string;
}

export interface Training {
  id: string;
  titel: string;
  datum: string; // YYYY-MM-DD
  gruppe?: string;
  teilnehmerAnzahl?: number;
  ort?: Ort;
  schwerpunkt?: Disziplin | "";
  eintraege: TrainingsEintrag[];
  notizen?: string;
  status: "geplant" | "abgeschlossen";
  reflexion?: Reflexion;
  erstelltAm: string;
}

export interface Teilnehmer {
  id: string;
  name: string;
  geschlecht?: "m" | "w";
  geburtsdatum?: string; // YYYY-MM-DD
  gruppe?: string;
  notizen?: string;
  aktiv: boolean;
  erstelltAm: string;
}

/** Erfasste Leistung (Zeit, Weite, Höhe, Punkte) eines Teilnehmers. */
export interface Leistung {
  id: string;
  teilnehmerId: string;
  /** z. B. "30m Sprint", "800m", "Weitsprung", "Schlagballwurf" */
  disziplin: string;
  wert: number;
  einheit: "s" | "min" | "m" | "Pkt.";
  datum: string; // YYYY-MM-DD
  bemerkung?: string;
  quelle: "manuell" | "stoppuhr" | "sportabzeichen";
}

export interface ChecklistenPunkt {
  id: string;
  text: string;
  erledigt: boolean;
}

export interface Checkliste {
  id: string;
  titel: string;
  punkte: ChecklistenPunkt[];
  erstelltAm: string;
}

export interface StoppuhrErgebnis {
  name: string;
  teilnehmerId?: string;
  /** Rundenzeiten in ms (kumulativ ab Start). */
  runden: number[];
  /** Endzeit in ms, null = nicht gestoppt. */
  endzeit: number | null;
}

export interface StoppuhrSession {
  id: string;
  datum: string; // ISO
  bezeichnung: string;
  ergebnisse: StoppuhrErgebnis[];
}

// ===== Sportabzeichen =====

export type DsaGruppe = "schnell" | "ausdauer" | "kraft" | "koord";

/** Ergebnisse eines Teilnehmers für ein Wettkampfjahr. */
export interface SportabzeichenEintrag {
  jahr: number;
  teilnehmerId: string;
  startNr?: number;
  /** Versuche als Rohtexte (z. B. "7,4" oder "4:50"), pro Gruppe. */
  versuche: Record<DsaGruppe, string[]>;
  schwimmnachweis: boolean;
}

export interface SportabzeichenEinstellungen {
  verein: string;
  veranstaltung: string;
  datum: string;
  jahr: number;
  /** Akzentfarbe der Druckvorlagen (Designvarianten). */
  farbe: string;
  reihenfolge: DsaGruppe[];
  rueckseiteDrucken: boolean;
  zonentabelle: boolean;
}

export interface WetterOrt {
  name: string;
  lat: number;
  lon: number;
}

// ===== Hallen- & Platzplaner =====

export type PlatzTyp = "halle" | "tartanplatz" | "bahn400";

/** Ein platziertes Element auf dem Plan (Koordinaten im 1000×600-Feldraster). */
export interface PlanElement {
  id: string;
  typ: string; // Schlüssel aus dem Element-Katalog
  x: number;
  y: number;
  rotation: number; // Grad
  skalierung: number; // 1 = Normalgröße
  beschriftung?: string;
}

export interface Platzplan {
  id: string;
  name: string;
  platz: PlatzTyp;
  elemente: PlanElement[];
  notizen?: string;
  erstelltAm: string;
  geaendertAm: string;
}

/** Einmalige Einrichtung: Welche Plätze gibt es, welches Material ist da? */
export interface PlatzKonfiguration {
  konfiguriert: boolean;
  aktivePlaetze: PlatzTyp[];
  /** Verfügbare Material-Elementtypen in der Halle bzw. draußen. */
  materialDrinnen: string[];
  materialDraussen: string[];
}

/** Gesamtzustand der App (eine Zeile je Eintrag in Supabase bzw. im Gast-Cache). */
export interface AppDaten {
  uebungen: Uebung[];
  medien: Medium[];
  trainings: Training[];
  teilnehmer: Teilnehmer[];
  leistungen: Leistung[];
  checklisten: Checkliste[];
  stoppuhrSessions: StoppuhrSession[];
  sportabzeichen: SportabzeichenEintrag[];
  platzplaene: Platzplan[];
  einstellungen: Record<string, unknown>;
}
