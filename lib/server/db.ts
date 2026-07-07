import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type {
  AppDaten,
  Checkliste,
  Leistung,
  Medium,
  Platzplan,
  SportabzeichenEintrag,
  StoppuhrSession,
  Teilnehmer,
  Training,
  Uebung,
} from "@/lib/types";
import { SEED_UEBUNGEN } from "@/lib/seed";

// Alle Nutzdaten liegen im Ordner ./daten (SQLite-Datei + Uploads).
// Der Ordner ist in .gitignore und lässt sich 1:1 auf ein anderes Gerät kopieren.

export const DATEN_DIR = path.join(process.cwd(), "daten");
export const UPLOAD_DIR = path.join(DATEN_DIR, "uploads");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS uebungen (id TEXT PRIMARY KEY, json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS medien (id TEXT PRIMARY KEY, uebung_id TEXT NOT NULL, json TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_medien_uebung ON medien(uebung_id);
  CREATE TABLE IF NOT EXISTS trainings (id TEXT PRIMARY KEY, json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS teilnehmer (id TEXT PRIMARY KEY, json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS leistungen (id TEXT PRIMARY KEY, teilnehmer_id TEXT NOT NULL, json TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_leistungen_teilnehmer ON leistungen(teilnehmer_id);
  CREATE TABLE IF NOT EXISTS checklisten (id TEXT PRIMARY KEY, json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS stoppuhr_sessions (id TEXT PRIMARY KEY, json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS platzplaene (id TEXT PRIMARY KEY, json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sportabzeichen (jahr INTEGER NOT NULL, teilnehmer_id TEXT NOT NULL, json TEXT NOT NULL, PRIMARY KEY (jahr, teilnehmer_id));
  CREATE TABLE IF NOT EXISTS einstellungen (key TEXT PRIMARY KEY, wert TEXT NOT NULL);
`;

function oeffnen(): Database.Database {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new Database(path.join(DATEN_DIR, "nachwuchscoach.db"));
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  // Beim allerersten Start den Übungs-Startbestand einspielen.
  const anzahl = db.prepare("SELECT COUNT(*) AS n FROM uebungen").get() as { n: number };
  if (anzahl.n === 0) {
    const einfuegen = db.prepare("INSERT INTO uebungen (id, json) VALUES (?, ?)");
    const alle = db.transaction((uebungen: Uebung[]) => {
      for (const u of uebungen) einfuegen.run(u.id, JSON.stringify(u));
    });
    alle(SEED_UEBUNGEN);
  }
  return db;
}

// Singleton, das Next.js-HMR im Dev-Modus überlebt.
const global_ = globalThis as unknown as { __nachwuchscoachDb?: Database.Database };
export const db: Database.Database = global_.__nachwuchscoachDb ?? oeffnen();
global_.__nachwuchscoachDb = db;

// ===== Generische Helfer =====

function alleAus<T>(tabelle: string): T[] {
  return (db.prepare(`SELECT json FROM ${tabelle}`).all() as { json: string }[]).map(
    (z) => JSON.parse(z.json) as T
  );
}

function upsert(tabelle: string, id: string, objekt: unknown): void {
  db.prepare(
    `INSERT INTO ${tabelle} (id, json) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json`
  ).run(id, JSON.stringify(objekt));
}

function loeschen(tabelle: string, id: string): void {
  db.prepare(`DELETE FROM ${tabelle} WHERE id = ?`).run(id);
}

// ===== Übungen =====

export const uebungenRepo = {
  alle: () => alleAus<Uebung>("uebungen"),
  speichern: (u: Uebung) => upsert("uebungen", u.id, u),
  loeschen: (id: string) => {
    loeschen("uebungen", id);
    // Zugehörige Mediendateien mit entfernen.
    for (const m of medienRepo.fuerUebung(id)) medienRepo.loeschen(m.id);
  },
};

// ===== Medien =====

export const medienRepo = {
  alle: () => alleAus<Medium>("medien"),
  fuerUebung: (uebungId: string) =>
    (
      db.prepare("SELECT json FROM medien WHERE uebung_id = ?").all(uebungId) as {
        json: string;
      }[]
    ).map((z) => JSON.parse(z.json) as Medium),
  holen: (id: string): Medium | undefined => {
    const zeile = db.prepare("SELECT json FROM medien WHERE id = ?").get(id) as
      | { json: string }
      | undefined;
    return zeile ? (JSON.parse(zeile.json) as Medium) : undefined;
  },
  speichern: (m: Medium) => {
    db.prepare(
      "INSERT INTO medien (id, uebung_id, json) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET uebung_id = excluded.uebung_id, json = excluded.json"
    ).run(m.id, m.uebungId, JSON.stringify(m));
  },
  loeschen: (id: string) => {
    const m = medienRepo.holen(id);
    if (m?.dateiname) {
      const pfad = path.join(UPLOAD_DIR, path.basename(m.dateiname));
      try {
        fs.unlinkSync(pfad);
      } catch {
        // Datei fehlt schon – egal.
      }
    }
    loeschen("medien", id);
  },
};

// ===== Weitere Entitäten =====

export const trainingsRepo = {
  alle: () => alleAus<Training>("trainings"),
  speichern: (t: Training) => upsert("trainings", t.id, t),
  loeschen: (id: string) => loeschen("trainings", id),
};

export const teilnehmerRepo = {
  alle: () => alleAus<Teilnehmer>("teilnehmer"),
  speichern: (t: Teilnehmer) => upsert("teilnehmer", t.id, t),
  loeschen: (id: string) => {
    loeschen("teilnehmer", id);
    db.prepare("DELETE FROM leistungen WHERE teilnehmer_id = ?").run(id);
    db.prepare("DELETE FROM sportabzeichen WHERE teilnehmer_id = ?").run(id);
  },
};

export const leistungenRepo = {
  alle: () => alleAus<Leistung>("leistungen"),
  speichern: (l: Leistung) => {
    db.prepare(
      "INSERT INTO leistungen (id, teilnehmer_id, json) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET teilnehmer_id = excluded.teilnehmer_id, json = excluded.json"
    ).run(l.id, l.teilnehmerId, JSON.stringify(l));
  },
  loeschen: (id: string) => loeschen("leistungen", id),
};

export const checklistenRepo = {
  alle: () => alleAus<Checkliste>("checklisten"),
  speichern: (c: Checkliste) => upsert("checklisten", c.id, c),
  loeschen: (id: string) => loeschen("checklisten", id),
};

export const stoppuhrRepo = {
  alle: () => alleAus<StoppuhrSession>("stoppuhr_sessions"),
  speichern: (s: StoppuhrSession) => upsert("stoppuhr_sessions", s.id, s),
  loeschen: (id: string) => loeschen("stoppuhr_sessions", id),
};

export const platzplaeneRepo = {
  alle: () => alleAus<Platzplan>("platzplaene"),
  speichern: (p: Platzplan) => upsert("platzplaene", p.id, p),
  loeschen: (id: string) => loeschen("platzplaene", id),
};

export const sportabzeichenRepo = {
  alle: () => alleAus<SportabzeichenEintrag>("sportabzeichen"),
  speichern: (e: SportabzeichenEintrag) => {
    db.prepare(
      "INSERT INTO sportabzeichen (jahr, teilnehmer_id, json) VALUES (?, ?, ?) ON CONFLICT(jahr, teilnehmer_id) DO UPDATE SET json = excluded.json"
    ).run(e.jahr, e.teilnehmerId, JSON.stringify(e));
  },
  loeschen: (jahr: number, teilnehmerId: string) => {
    db.prepare("DELETE FROM sportabzeichen WHERE jahr = ? AND teilnehmer_id = ?").run(
      jahr,
      teilnehmerId
    );
  },
};

export const einstellungenRepo = {
  alle: (): Record<string, unknown> => {
    const zeilen = db.prepare("SELECT key, wert FROM einstellungen").all() as {
      key: string;
      wert: string;
    }[];
    return Object.fromEntries(zeilen.map((z) => [z.key, JSON.parse(z.wert)]));
  },
  setzen: (key: string, wert: unknown) => {
    db.prepare(
      "INSERT INTO einstellungen (key, wert) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET wert = excluded.wert"
    ).run(key, JSON.stringify(wert));
  },
};

// ===== Gesamtabzug / Import =====

export function gesamtDaten(): AppDaten {
  return {
    uebungen: uebungenRepo.alle(),
    medien: medienRepo.alle(),
    trainings: trainingsRepo.alle(),
    teilnehmer: teilnehmerRepo.alle(),
    leistungen: leistungenRepo.alle(),
    checklisten: checklistenRepo.alle(),
    stoppuhrSessions: stoppuhrRepo.alle(),
    sportabzeichen: sportabzeichenRepo.alle(),
    platzplaene: platzplaeneRepo.alle(),
    einstellungen: einstellungenRepo.alle(),
  };
}

/**
 * Import einer Sicherung. modus "ersetzen" leert alle Tabellen vorher,
 * "zusammenfuehren" ergänzt/überschreibt nur die enthaltenen Datensätze.
 * Hochgeladene Mediendateien sind nicht Teil der JSON-Sicherung.
 */
export function importieren(daten: Partial<AppDaten>, modus: "ersetzen" | "zusammenfuehren") {
  const tx = db.transaction(() => {
    if (modus === "ersetzen") {
      for (const t of [
        "uebungen",
        "medien",
        "trainings",
        "teilnehmer",
        "leistungen",
        "checklisten",
        "stoppuhr_sessions",
        "sportabzeichen",
        "platzplaene",
        "einstellungen",
      ]) {
        db.prepare(`DELETE FROM ${t}`).run();
      }
    }
    daten.uebungen?.forEach((u) => uebungenRepo.speichern(u));
    daten.medien?.forEach((m) => medienRepo.speichern(m));
    daten.trainings?.forEach((t) => trainingsRepo.speichern(t));
    daten.teilnehmer?.forEach((t) => teilnehmerRepo.speichern(t));
    daten.leistungen?.forEach((l) => leistungenRepo.speichern(l));
    daten.checklisten?.forEach((c) => checklistenRepo.speichern(c));
    daten.stoppuhrSessions?.forEach((s) => stoppuhrRepo.speichern(s));
    daten.sportabzeichen?.forEach((e) => sportabzeichenRepo.speichern(e));
    daten.platzplaene?.forEach((p) => platzplaeneRepo.speichern(p));
    if (daten.einstellungen) {
      for (const [key, wert] of Object.entries(daten.einstellungen)) {
        einstellungenRepo.setzen(key, wert);
      }
    }
  });
  tx();
}
