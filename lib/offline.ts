import type { AppDaten } from "./types";

// Offline-Bausteine: lokaler Datencache (Sofortstart + Lesen ohne Netz) und
// Schreib-Warteschlange (Änderungen ohne Netz werden gesammelt und beim
// nächsten Kontakt in der ursprünglichen Reihenfolge nachgezogen).
// Beides pro Nutzer in localStorage – die Datenmengen sind klein (JSON,
// Medien liegen als Dateien im Supabase-Storage und werden vom Service
// Worker gecacht).

const CACHE_PREFIX = "nachwuchscoach-cache-v1-";
const QUEUE_PREFIX = "nachwuchscoach-warteschlange-v1-";

/** Eine aufgeschobene Schreiboperation gegen Supabase. */
export interface SchreibAktion {
  tabelle: string;
  typ: "upsert" | "loeschen";
  /** Für upsert: die komplette Zeile. */
  zeile?: Record<string, unknown>;
  onConflict?: string;
  /** Für loeschen: eq-Filter (Spalte → Wert). */
  filter?: Record<string, string | number>;
}

export function cacheLaden(userId: string): AppDaten | null {
  try {
    const roh = localStorage.getItem(CACHE_PREFIX + userId);
    return roh ? (JSON.parse(roh) as AppDaten) : null;
  } catch {
    return null;
  }
}

export function cacheSpeichern(userId: string, daten: AppDaten): void {
  try {
    localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(daten));
  } catch {
    // Speicher voll – Cache ist Komfort, kein Muss.
  }
}

export function warteschlangeLaden(userId: string): SchreibAktion[] {
  try {
    const roh = localStorage.getItem(QUEUE_PREFIX + userId);
    return roh ? (JSON.parse(roh) as SchreibAktion[]) : [];
  } catch {
    return [];
  }
}

export function warteschlangeSpeichern(userId: string, aktionen: SchreibAktion[]): void {
  try {
    if (aktionen.length === 0) {
      localStorage.removeItem(QUEUE_PREFIX + userId);
    } else {
      localStorage.setItem(QUEUE_PREFIX + userId, JSON.stringify(aktionen));
    }
  } catch {
    // Wenn selbst das fehlschlägt, bleibt nur der Fehlerlog der Aktion.
  }
}

/** Grobe Erkennung "kein Netz" anhand der Fehlermeldung von fetch/Supabase. */
export function istNetzwerkFehler(meldung?: string | null): boolean {
  const m = (meldung ?? "").toLowerCase();
  return (
    m.includes("fetch") ||
    m.includes("network") ||
    m.includes("load failed") ||
    m.includes("timeout") ||
    m.includes("aborted")
  );
}
