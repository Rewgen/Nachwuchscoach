"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
} from "./types";

// Zugriffsschicht des Clients: lädt einmal den Gesamtzustand vom Server
// (GET /api/daten) und hält ihn im Speicher. Mutationen aktualisieren den
// lokalen Zustand sofort und schreiben parallel über die API in SQLite.

const MERKLISTE_KEY = "nachwuchscoach-merkliste";
const ALT_KEY = "nachwuchscoach-daten-v1"; // localStorage-Format der Rohversion
const MIGRIERT_KEY = "nachwuchscoach-migriert";

interface StoreWert {
  bereit: boolean;
  daten: AppDaten;
  entwurf: string[];
  // Übungen & Medien
  uebungSpeichern: (u: Uebung) => void;
  uebungLoeschen: (id: string) => void;
  favoritUmschalten: (id: string) => void;
  mediumHochladen: (uebungId: string, datei: File, reihenfolge: number) => Promise<Medium | null>;
  mediumSpeichern: (m: Medium) => void;
  mediumLoeschen: (id: string) => void;
  // Trainings
  trainingSpeichern: (t: Training) => void;
  trainingLoeschen: (id: string) => void;
  // Teilnehmer & Leistungen
  teilnehmerSpeichern: (t: Teilnehmer) => void;
  teilnehmerLoeschen: (id: string) => void;
  leistungSpeichern: (l: Leistung) => void;
  leistungLoeschen: (id: string) => void;
  // Checklisten & Stoppuhr
  checklisteSpeichern: (c: Checkliste) => void;
  checklisteLoeschen: (id: string) => void;
  stoppuhrSessionSpeichern: (s: StoppuhrSession) => void;
  stoppuhrSessionLoeschen: (id: string) => void;
  // Platzplaner
  platzplanSpeichern: (p: Platzplan) => void;
  platzplanLoeschen: (id: string) => void;
  // Sportabzeichen & Einstellungen
  sportabzeichenSpeichern: (e: SportabzeichenEintrag) => void;
  sportabzeichenLoeschen: (jahr: number, teilnehmerId: string) => void;
  einstellungSetzen: (key: string, wert: unknown) => void;
  // Merkliste
  entwurfUmschalten: (uebungId: string) => void;
  entwurfLeeren: () => void;
  // Datenverwaltung
  datenImportieren: (json: string, modus: "ersetzen" | "zusammenfuehren") => Promise<string | null>;
}

const LEER: AppDaten = {
  uebungen: [],
  medien: [],
  trainings: [],
  teilnehmer: [],
  leistungen: [],
  checklisten: [],
  stoppuhrSessions: [],
  sportabzeichen: [],
  platzplaene: [],
  einstellungen: {},
};

const StoreContext = createContext<StoreWert | null>(null);

async function api(pfad: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(pfad, init);
  if (!res.ok) {
    console.error(`API-Fehler ${res.status} bei ${pfad}`);
  }
  return res;
}

function postJson(pfad: string, body: unknown) {
  return api(pfad, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function DatenProvider({ children }: { children: ReactNode }) {
  const [daten, setDaten] = useState<AppDaten>(LEER);
  const [bereit, setBereit] = useState(false);
  const [entwurf, setEntwurf] = useState<string[]>([]);
  const geladen = useRef(false);

  useEffect(() => {
    if (geladen.current) return;
    geladen.current = true;
    (async () => {
      // Einmalige Übernahme der alten localStorage-Daten aus der Rohversion.
      try {
        const alt = localStorage.getItem(ALT_KEY);
        if (alt && !localStorage.getItem(MIGRIERT_KEY)) {
          const geparst = JSON.parse(alt) as { uebungen?: Uebung[]; trainings?: Training[] };
          await postJson("/api/import", {
            daten: { uebungen: geparst.uebungen, trainings: geparst.trainings },
            modus: "zusammenfuehren",
          });
          localStorage.setItem(MIGRIERT_KEY, "1");
        }
        const merkliste = localStorage.getItem(MERKLISTE_KEY);
        if (merkliste) setEntwurf(JSON.parse(merkliste));
      } catch {
        // Migration/Merkliste sind optional – Fehler nicht blockieren lassen.
      }
      try {
        const res = await api("/api/daten");
        setDaten((await res.json()) as AppDaten);
      } catch (e) {
        console.error("Daten konnten nicht geladen werden:", e);
      }
      setBereit(true);
    })();
  }, []);

  useEffect(() => {
    if (!bereit) return;
    try {
      localStorage.setItem(MERKLISTE_KEY, JSON.stringify(entwurf));
    } catch {
      // localStorage voll/gesperrt – Merkliste ist verzichtbar.
    }
  }, [entwurf, bereit]);

  // ===== Generische Upsert/Delete-Helfer =====

  const upsert = useCallback(
    <K extends keyof AppDaten, T extends { id: string }>(feld: K, pfad: string, objekt: T) => {
      setDaten((d) => {
        const liste = d[feld] as unknown as T[];
        const vorhanden = liste.some((x) => x.id === objekt.id);
        return {
          ...d,
          [feld]: vorhanden
            ? liste.map((x) => (x.id === objekt.id ? objekt : x))
            : [...liste, objekt],
        };
      });
      void postJson(pfad, objekt);
    },
    []
  );

  const entfernen = useCallback(
    <K extends keyof AppDaten>(feld: K, pfad: string, id: string) => {
      setDaten((d) => ({
        ...d,
        [feld]: (d[feld] as unknown as { id: string }[]).filter((x) => x.id !== id),
      }));
      void api(`${pfad}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    },
    []
  );

  // ===== Übungen & Medien =====

  const uebungSpeichern = useCallback(
    (u: Uebung) => upsert("uebungen", "/api/uebungen", u),
    [upsert]
  );

  const uebungLoeschen = useCallback((id: string) => {
    setDaten((d) => ({
      ...d,
      uebungen: d.uebungen.filter((x) => x.id !== id),
      medien: d.medien.filter((m) => m.uebungId !== id),
    }));
    setEntwurf((e) => e.filter((x) => x !== id));
    void api(`/api/uebungen?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }, []);

  const favoritUmschalten = useCallback((id: string) => {
    setDaten((d) => {
      const u = d.uebungen.find((x) => x.id === id);
      if (u) void postJson("/api/uebungen", { ...u, favorit: !u.favorit });
      return {
        ...d,
        uebungen: d.uebungen.map((x) => (x.id === id ? { ...x, favorit: !x.favorit } : x)),
      };
    });
  }, []);

  const mediumHochladen = useCallback(
    async (uebungId: string, datei: File, reihenfolge: number): Promise<Medium | null> => {
      const form = new FormData();
      form.append("datei", datei);
      form.append("uebungId", uebungId);
      form.append("reihenfolge", String(reihenfolge));
      const res = await api("/api/medien", { method: "POST", body: form });
      if (!res.ok) return null;
      const medium = (await res.json()) as Medium;
      setDaten((d) => ({ ...d, medien: [...d.medien, medium] }));
      return medium;
    },
    []
  );

  const mediumSpeichern = useCallback(
    (m: Medium) => upsert("medien", "/api/medien", m),
    [upsert]
  );

  const mediumLoeschen = useCallback(
    (id: string) => entfernen("medien", "/api/medien", id),
    [entfernen]
  );

  // ===== Übrige Entitäten =====

  const trainingSpeichern = useCallback(
    (t: Training) => upsert("trainings", "/api/trainings", t),
    [upsert]
  );
  const trainingLoeschen = useCallback(
    (id: string) => entfernen("trainings", "/api/trainings", id),
    [entfernen]
  );

  const teilnehmerSpeichern = useCallback(
    (t: Teilnehmer) => upsert("teilnehmer", "/api/teilnehmer", t),
    [upsert]
  );
  const teilnehmerLoeschen = useCallback(
    (id: string) => {
      setDaten((d) => ({
        ...d,
        teilnehmer: d.teilnehmer.filter((x) => x.id !== id),
        leistungen: d.leistungen.filter((l) => l.teilnehmerId !== id),
        sportabzeichen: d.sportabzeichen.filter((s) => s.teilnehmerId !== id),
      }));
      void api(`/api/teilnehmer?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    },
    []
  );

  const leistungSpeichern = useCallback(
    (l: Leistung) => upsert("leistungen", "/api/leistungen", l),
    [upsert]
  );
  const leistungLoeschen = useCallback(
    (id: string) => entfernen("leistungen", "/api/leistungen", id),
    [entfernen]
  );

  const checklisteSpeichern = useCallback(
    (c: Checkliste) => upsert("checklisten", "/api/checklisten", c),
    [upsert]
  );
  const checklisteLoeschen = useCallback(
    (id: string) => entfernen("checklisten", "/api/checklisten", id),
    [entfernen]
  );

  const stoppuhrSessionSpeichern = useCallback(
    (s: StoppuhrSession) => upsert("stoppuhrSessions", "/api/stoppuhr", s),
    [upsert]
  );
  const stoppuhrSessionLoeschen = useCallback(
    (id: string) => entfernen("stoppuhrSessions", "/api/stoppuhr", id),
    [entfernen]
  );

  const platzplanSpeichern = useCallback(
    (p: Platzplan) => upsert("platzplaene", "/api/platzplaene", p),
    [upsert]
  );
  const platzplanLoeschen = useCallback(
    (id: string) => entfernen("platzplaene", "/api/platzplaene", id),
    [entfernen]
  );

  const sportabzeichenSpeichern = useCallback((e: SportabzeichenEintrag) => {
    setDaten((d) => {
      const vorhanden = d.sportabzeichen.some(
        (x) => x.jahr === e.jahr && x.teilnehmerId === e.teilnehmerId
      );
      return {
        ...d,
        sportabzeichen: vorhanden
          ? d.sportabzeichen.map((x) =>
              x.jahr === e.jahr && x.teilnehmerId === e.teilnehmerId ? e : x
            )
          : [...d.sportabzeichen, e],
      };
    });
    void postJson("/api/sportabzeichen", e);
  }, []);

  const sportabzeichenLoeschen = useCallback((jahr: number, teilnehmerId: string) => {
    setDaten((d) => ({
      ...d,
      sportabzeichen: d.sportabzeichen.filter(
        (x) => !(x.jahr === jahr && x.teilnehmerId === teilnehmerId)
      ),
    }));
    void api(
      `/api/sportabzeichen?jahr=${jahr}&teilnehmerId=${encodeURIComponent(teilnehmerId)}`,
      { method: "DELETE" }
    );
  }, []);

  const einstellungSetzen = useCallback((key: string, wert: unknown) => {
    setDaten((d) => ({ ...d, einstellungen: { ...d.einstellungen, [key]: wert } }));
    void postJson("/api/einstellungen", { key, wert });
  }, []);

  // ===== Merkliste =====

  const entwurfUmschalten = useCallback((uebungId: string) => {
    setEntwurf((e) =>
      e.includes(uebungId) ? e.filter((x) => x !== uebungId) : [...e, uebungId]
    );
  }, []);

  const entwurfLeeren = useCallback(() => setEntwurf([]), []);

  // ===== Import =====

  const datenImportieren = useCallback(
    async (json: string, modus: "ersetzen" | "zusammenfuehren"): Promise<string | null> => {
      let geparst: unknown;
      try {
        geparst = JSON.parse(json);
      } catch {
        return "Die Datei ist kein gültiges JSON.";
      }
      const res = await postJson("/api/import", { daten: geparst, modus });
      if (!res.ok) return "Der Import ist fehlgeschlagen.";
      setDaten((await res.json()) as AppDaten);
      return null;
    },
    []
  );

  const wert = useMemo<StoreWert>(
    () => ({
      bereit,
      daten,
      entwurf,
      uebungSpeichern,
      uebungLoeschen,
      favoritUmschalten,
      mediumHochladen,
      mediumSpeichern,
      mediumLoeschen,
      trainingSpeichern,
      trainingLoeschen,
      teilnehmerSpeichern,
      teilnehmerLoeschen,
      leistungSpeichern,
      leistungLoeschen,
      checklisteSpeichern,
      checklisteLoeschen,
      stoppuhrSessionSpeichern,
      stoppuhrSessionLoeschen,
      platzplanSpeichern,
      platzplanLoeschen,
      sportabzeichenSpeichern,
      sportabzeichenLoeschen,
      einstellungSetzen,
      entwurfUmschalten,
      entwurfLeeren,
      datenImportieren,
    }),
    [
      bereit,
      daten,
      entwurf,
      uebungSpeichern,
      uebungLoeschen,
      favoritUmschalten,
      mediumHochladen,
      mediumSpeichern,
      mediumLoeschen,
      trainingSpeichern,
      trainingLoeschen,
      teilnehmerSpeichern,
      teilnehmerLoeschen,
      leistungSpeichern,
      leistungLoeschen,
      checklisteSpeichern,
      checklisteLoeschen,
      stoppuhrSessionSpeichern,
      stoppuhrSessionLoeschen,
      platzplanSpeichern,
      platzplanLoeschen,
      sportabzeichenSpeichern,
      sportabzeichenLoeschen,
      einstellungSetzen,
      entwurfUmschalten,
      entwurfLeeren,
      datenImportieren,
    ]
  );

  return <StoreContext.Provider value={wert}>{children}</StoreContext.Provider>;
}

export function useDaten(): StoreWert {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useDaten muss innerhalb von <DatenProvider> genutzt werden.");
  return ctx;
}

// ===== Abgeleitete Helfer =====

/** Alle Einsätze einer Übung in Trainings, neueste zuerst. */
export function einsaetzeFuerUebung(trainings: Training[], uebungId: string) {
  return trainings
    .flatMap((t) =>
      t.eintraege
        .filter((e) => e.uebungId === uebungId)
        .map((e) => ({ training: t, eintrag: e }))
    )
    .sort((a, b) => b.training.datum.localeCompare(a.training.datum));
}

/** Gesammelte Materialliste eines Trainings (ohne Duplikate). */
export function materialFuerTraining(training: Training, uebungen: Uebung[]): string[] {
  const menge = new Set<string>();
  for (const e of training.eintraege) {
    const u = uebungen.find((x) => x.id === e.uebungId);
    u?.material.forEach((m) => menge.add(m));
  }
  return [...menge].sort((a, b) => a.localeCompare(b, "de"));
}

/** Medien einer Übung in Anzeige-Reihenfolge. */
export function medienFuerUebung(medien: Medium[], uebungId: string): Medium[] {
  return medien
    .filter((m) => m.uebungId === uebungId)
    .sort((a, b) => a.reihenfolge - b.reihenfolge);
}

/** URL, unter der eine hochgeladene Mediendatei erreichbar ist. */
export function mediumUrl(m: Medium): string {
  if (m.typ === "youtube") return m.url ?? "";
  return `/api/medien/datei/${m.dateiname}`;
}

/** YouTube-Video-ID aus einem normalen Link. */
export function youtubeId(url: string): string | null {
  const treffer = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/
  );
  return treffer ? treffer[1] : null;
}

/** YouTube-Embed-URL aus einem normalen Link. */
export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

/** Vorschaubild eines YouTube-Videos. */
export function youtubeVorschau(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function neueId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}
