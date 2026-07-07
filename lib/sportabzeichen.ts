import type { DsaGruppe, SportabzeichenEintrag, Teilnehmer } from "./types";

// Offizielle DSA-Anforderungen (Kinder/Jugend), übernommen aus der bewährten
// Laufzettel-Vorlage (Referenzsystem/Etus Wedau, Stand 2026).

export interface DsaDisziplin {
  label: string;
  einheit: "s" | "min" | "m" | "Pkt.";
  /** "low" = kleinerer Wert besser (Zeiten), "high" = größerer Wert besser. */
  richtung: "low" | "high";
  /** Anforderungen [Bronze, Silber, Gold] als Anzeigetexte. */
  werte: [string, string, string];
}

export type DsaAltersband = "6-7" | "8-9" | "10-11" | "12-13" | "14-15" | "16-17";

export const DSA_GRUPPEN: DsaGruppe[] = ["schnell", "ausdauer", "kraft", "koord"];

export const DSA_GRUPPEN_NAMEN: Record<DsaGruppe, string> = {
  schnell: "Schnelligkeit",
  ausdauer: "Ausdauer",
  kraft: "Kraft",
  koord: "Koordination",
};

export const DSA_GRUPPEN_FARBEN: Record<DsaGruppe, string> = {
  schnell: "#ef4444",
  ausdauer: "#10b981",
  kraft: "#f59e0b",
  koord: "#6366f1",
};

function d(
  label: string,
  einheit: DsaDisziplin["einheit"],
  richtung: DsaDisziplin["richtung"],
  b: string,
  s: string,
  g: string
): DsaDisziplin {
  return { label, einheit, richtung, werte: [b, s, g] };
}

type Katalog = Record<
  "w" | "m",
  Record<DsaAltersband, Record<DsaGruppe, DsaDisziplin>>
>;

export const DSA_KATALOG: Katalog = {
  w: {
    "6-7": {
      schnell: d("Sprinten 30m", "s", "low", "8,0", "7,1", "6,3"),
      ausdauer: d("Laufen 800m", "min", "low", "5:40", "5:00", "4:15"),
      kraft: d("Werfen Schlagball (80g)", "m", "high", "6,00", "9,00", "12,00"),
      koord: d("Springen Zonenweitsprung", "Pkt.", "high", "18", "21", "24"),
    },
    "8-9": {
      schnell: d("Sprinten 30m", "s", "low", "7,4", "6,6", "5,7"),
      ausdauer: d("Laufen 800m", "min", "low", "5:35", "4:50", "4:10"),
      kraft: d("Werfen Schlagball (80g)", "m", "high", "9,00", "12,00", "15,00"),
      koord: d("Springen Zonenweitsprung", "Pkt.", "high", "24", "27", "30"),
    },
    "10-11": {
      schnell: d("Sprinten 50m", "s", "low", "11,0", "10,1", "9,1"),
      ausdauer: d("Laufen 800m", "min", "low", "5:20", "4:40", "4:00"),
      kraft: d("Werfen Schlagball (80g)", "m", "high", "11,00", "15,00", "18,00"),
      koord: d("Springen Weitsprung", "m", "high", "2,30", "2,60", "2,90"),
    },
    "12-13": {
      schnell: d("Sprinten 50m", "s", "low", "10,6", "9,6", "8,5"),
      ausdauer: d("Laufen 800m", "min", "low", "5:10", "4:25", "3:45"),
      kraft: d("Werfen Schlagball (80g)", "m", "high", "15,00", "18,00", "22,00"),
      koord: d("Springen Weitsprung", "m", "high", "2,80", "3,10", "3,40"),
    },
    "14-15": {
      schnell: d("Sprinten 100m", "s", "low", "18,6", "17,0", "15,5"),
      ausdauer: d("Laufen 800m", "min", "low", "5:00", "4:20", "3:35"),
      kraft: d("Werfen Wurfball (200g)", "m", "high", "20,00", "24,00", "27,00"),
      koord: d("Springen Weitsprung", "m", "high", "3,20", "3,50", "3,80"),
    },
    "16-17": {
      schnell: d("Sprinten 100m", "s", "low", "17,6", "16,3", "15,0"),
      ausdauer: d("Laufen 800m", "min", "low", "4:50", "4:05", "3:25"),
      kraft: d("Werfen Wurfball (200g)", "m", "high", "24,00", "27,00", "31,00"),
      koord: d("Springen Weitsprung", "m", "high", "3,40", "3,70", "4,00"),
    },
  },
  m: {
    "6-7": {
      schnell: d("Sprinten 30m", "s", "low", "7,7", "6,8", "6,0"),
      ausdauer: d("Laufen 800m", "min", "low", "5:40", "5:00", "4:15"),
      kraft: d("Werfen Schlagball (80g)", "m", "high", "12,00", "15,00", "17,00"),
      koord: d("Springen Zonenweitsprung", "Pkt.", "high", "18", "21", "24"),
    },
    "8-9": {
      schnell: d("Sprinten 30m", "s", "low", "7,2", "6,4", "5,7"),
      ausdauer: d("Laufen 800m", "min", "low", "5:25", "4:40", "3:55"),
      kraft: d("Werfen Schlagball (80g)", "m", "high", "17,00", "20,00", "23,00"),
      koord: d("Springen Zonenweitsprung", "Pkt.", "high", "27", "30", "33"),
    },
    "10-11": {
      schnell: d("Sprinten 50m", "s", "low", "10,3", "9,3", "8,4"),
      ausdauer: d("Laufen 800m", "min", "low", "5:05", "4:20", "3:35"),
      kraft: d("Werfen Schlagball (80g)", "m", "high", "21,00", "25,00", "28,00"),
      koord: d("Springen Weitsprung", "m", "high", "2,60", "2,90", "3,20"),
    },
    "12-13": {
      schnell: d("Sprinten 50m", "s", "low", "9,7", "8,9", "8,1"),
      ausdauer: d("Laufen 800m", "min", "low", "4:45", "4:00", "3:15"),
      kraft: d("Werfen Wurfball (200g)", "m", "high", "26,00", "30,00", "33,00"),
      koord: d("Springen Weitsprung", "m", "high", "3,20", "3,50", "3,80"),
    },
    "14-15": {
      schnell: d("Sprinten 100m", "s", "low", "17,0", "15,4", "14,1"),
      ausdauer: d("Laufen 800m", "min", "low", "4:20", "3:40", "3:00"),
      kraft: d("Werfen Wurfball (200g)", "m", "high", "30,00", "34,00", "37,00"),
      koord: d("Springen Weitsprung", "m", "high", "3,80", "4,10", "4,40"),
    },
    "16-17": {
      schnell: d("Sprinten 100m", "s", "low", "16,3", "14,8", "13,5"),
      ausdauer: d("Laufen 800m", "min", "low", "4:05", "3:25", "2:45"),
      kraft: d("Werfen Wurfball (200g)", "m", "high", "34,00", "38,00", "42,00"),
      koord: d("Springen Weitsprung", "m", "high", "4,30", "4,60", "4,90"),
    },
  },
};

/** Zonenweitsprung-Wertetabelle (Zonenbreite 25 cm). */
export const DSA_ZONEN: [string, string][] = [
  ["bis 0,25 m", "1"],
  ["über 0,25 m", "2"],
  ["über 0,50 m", "3"],
  ["über 0,75 m", "4"],
  ["über 1,00 m", "5"],
  ["über 1,25 m", "6"],
  ["über 1,50 m", "7"],
  ["über 1,75 m", "8"],
  ["über 2,00 m", "9"],
  ["über 2,25 m", "10"],
  ["über 2,50 m", "11"],
  ["über 2,75 m", "12"],
  ["über 3,00 m", "13"],
];

export type Medaille = "bronze" | "silber" | "gold";
export const MEDAILLEN_PUNKTE: Record<Medaille, number> = { bronze: 1, silber: 2, gold: 3 };

// ===== Logik =====

/** "7,4" → 7.4; "4:50" → Sekunden; leere/kaputte Eingaben → NaN. */
export function dsaZahl(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return NaN;
  if (typeof v === "number") return v;
  const text = String(v).trim().replace(",", ".");
  if (text === "") return NaN;
  if (text.includes(":")) {
    const [min, sek] = text.split(":");
    return (parseFloat(min) || 0) * 60 + (parseFloat(sek) || 0);
  }
  return parseFloat(text);
}

/** DSA-Alter = Wettkampfjahr − Geburtsjahr (Stichtag Jahresende). */
export function dsaAlter(teilnehmer: Teilnehmer, jahr: number): number | null {
  if (!teilnehmer.geburtsdatum) return null;
  const geburtsjahr = parseInt(teilnehmer.geburtsdatum.slice(0, 4), 10);
  if (isNaN(geburtsjahr)) return null;
  return jahr - geburtsjahr;
}

export function altersband(alter: number): DsaAltersband {
  const a = Math.min(17, Math.max(6, alter));
  if (a <= 7) return "6-7";
  if (a <= 9) return "8-9";
  if (a <= 11) return "10-11";
  if (a <= 13) return "12-13";
  if (a <= 15) return "14-15";
  return "16-17";
}

export function istJung(band: DsaAltersband): boolean {
  return band === "6-7" || band === "8-9";
}

/** Anzahl Versuchsfelder: Ausdauer 1, Zonenweitsprung 4, sonst 3. */
export function versucheAnzahl(disziplin: DsaDisziplin): number {
  if (disziplin.einheit === "min") return 1;
  if (disziplin.einheit === "Pkt.") return 4;
  return 3;
}

/** Bestwert: Zeit = Minimum, Zonenweitsprung = Summe der besten 3, sonst Maximum. */
export function bestwert(disziplin: DsaDisziplin, versuche: string[]): number | null {
  const zahlen = (versuche ?? []).map(dsaZahl).filter((n) => !isNaN(n));
  if (zahlen.length === 0) return null;
  if (disziplin.richtung === "low") return Math.min(...zahlen);
  if (disziplin.einheit === "Pkt.") {
    return [...zahlen]
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((s, x) => s + x, 0);
  }
  return Math.max(...zahlen);
}

export function medailleFuerWert(
  disziplin: DsaDisziplin,
  wert: number | null
): Medaille | "keine" | null {
  if (wert === null || isNaN(wert)) return null;
  const [b, s, g] = disziplin.werte.map(dsaZahl);
  if (disziplin.richtung === "low") {
    if (wert <= g) return "gold";
    if (wert <= s) return "silber";
    if (wert <= b) return "bronze";
    return "keine";
  }
  if (wert >= g) return "gold";
  if (wert >= s) return "silber";
  if (wert >= b) return "bronze";
  return "keine";
}

export function bestwertFormat(disziplin: DsaDisziplin, wert: number | null): string {
  if (wert === null || isNaN(wert)) return "–";
  if (disziplin.einheit === "min") {
    let m = Math.floor(wert / 60);
    let s = Math.round(wert % 60);
    if (s === 60) {
      m++;
      s = 0;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  if (disziplin.einheit === "s") return (Math.round(wert * 10) / 10).toFixed(1).replace(".", ",");
  if (disziplin.einheit === "m") return (Math.round(wert * 100) / 100).toFixed(2).replace(".", ",");
  return String(Math.round(wert));
}

export function einheitLabel(einheit: DsaDisziplin["einheit"]): string {
  if (einheit === "s") return "Sek.";
  if (einheit === "m") return "Meter";
  if (einheit === "Pkt.") return "Punkte";
  return einheit;
}

export interface DsaGesamt {
  fertig: boolean;
  punkte: number;
  abzeichen: Medaille | "keine";
}

/** Gesamtwertung: alle 4 Gruppen nötig; 4–7 Bronze, 8–10 Silber, 11–12 Gold. */
export function gesamtwertung(
  geschlecht: "m" | "w",
  band: DsaAltersband,
  eintrag: SportabzeichenEintrag
): DsaGesamt {
  let punkte = 0;
  let fertig = true;
  for (const gruppe of DSA_GRUPPEN) {
    const disziplin = DSA_KATALOG[geschlecht][band][gruppe];
    const medaille = medailleFuerWert(disziplin, bestwert(disziplin, eintrag.versuche[gruppe]));
    if (!medaille || medaille === "keine") {
      fertig = false;
    } else {
      punkte += MEDAILLEN_PUNKTE[medaille];
    }
  }
  if (!fertig) return { fertig: false, punkte, abzeichen: "keine" };
  return {
    fertig: true,
    punkte,
    abzeichen: punkte >= 11 ? "gold" : punkte >= 8 ? "silber" : "bronze",
  };
}

export function leereVersuche(): Record<DsaGruppe, string[]> {
  return { schnell: [], ausdauer: [], kraft: [], koord: [] };
}

// ===== Druck-/Anzeigeeinstellungen =====

export interface SportabzeichenSettings {
  verein: string;
  veranstaltung: string;
  datum: string;
  /** Akzentfarbe der Druckvorlagen (Designvarianten). */
  farbe: string;
}

export const SPORTABZEICHEN_STANDARD: SportabzeichenSettings = {
  verein: "ETuS Wedau",
  veranstaltung: "Sportabzeichen-Fest",
  datum: "",
  farbe: "#0369a1",
};

export function sportabzeichenSettings(
  einstellungen: Record<string, unknown>
): SportabzeichenSettings {
  return {
    ...SPORTABZEICHEN_STANDARD,
    ...((einstellungen["sportabzeichen"] as Partial<SportabzeichenSettings>) ?? {}),
  };
}
