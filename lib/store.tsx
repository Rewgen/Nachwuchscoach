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
import { supabase, supabaseKonfiguriert, storageUrl } from "./supabase";
import {
  cacheLaden,
  cacheLoeschen,
  cacheSpeichern,
  istNetzwerkFehler,
  warteschlangeLaden,
  warteschlangeSpeichern,
  type SchreibAktion,
} from "./offline";
import { SEED_UEBUNGEN } from "./seed";

// Zugriffsschicht des Clients: Supabase (Postgres + Storage + Google-Login)
// mit Offline-Unterbau. Der Gesamtzustand wird beim Start sofort aus dem
// lokalen Cache angezeigt und im Hintergrund vom Server aktualisiert.
// Schreibvorgänge laufen über eine Warteschlange: ohne Netz werden sie
// gesammelt und bei Wiederverbindung in ursprünglicher Reihenfolge
// nachgezogen (Row Level Security trennt die Konten serverseitig).

const MERKLISTE_KEY = "nachwuchscoach-merkliste";
// Gast-Modus: App ohne Konto, Daten bleiben nur auf diesem Gerät.
const GAST_ID = "gast";
const GAST_FLAG = "nachwuchscoach-gastmodus";

interface StoreWert {
  bereit: boolean;
  daten: AppDaten;
  entwurf: string[];
  // Konto
  konfigFehlt: boolean;
  angemeldet: boolean;
  nutzerEmail: string | null;
  anmeldenMitGoogle: () => void;
  abmelden: () => void;
  /** true = App läuft ohne Konto, Daten nur auf diesem Gerät. */
  gastModus: boolean;
  alsGastFortfahren: () => void;
  // Offline
  offline: boolean;
  wartendeAenderungen: number;
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

/**
 * Eine Schreibaktion gegen Supabase ausführen.
 * "netzfehler" = später erneut versuchen; fachliche Fehler werden geloggt
 * und nicht wiederholt (sonst bliebe die Warteschlange ewig hängen).
 */
async function aktionAusfuehren(aktion: SchreibAktion): Promise<"ok" | "netzfehler"> {
  if (!supabase) return "ok";
  try {
    let fehler: { message: string } | null = null;
    if (aktion.typ === "upsert") {
      ({ error: fehler } = await supabase
        .from(aktion.tabelle)
        .upsert(aktion.zeile!, aktion.onConflict ? { onConflict: aktion.onConflict } : undefined));
    } else {
      let abfrage = supabase.from(aktion.tabelle).delete();
      for (const [spalte, wert] of Object.entries(aktion.filter ?? {})) {
        abfrage = abfrage.eq(spalte, wert);
      }
      ({ error: fehler } = await abfrage);
    }
    if (fehler) {
      if (istNetzwerkFehler(fehler.message)) return "netzfehler";
      console.error(`Supabase-Fehler (${aktion.tabelle}):`, fehler.message);
      return "ok";
    }
    return "ok";
  } catch (e) {
    if (istNetzwerkFehler((e as Error).message)) return "netzfehler";
    console.error(`Supabase-Fehler (${aktion.tabelle}):`, e);
    return "ok";
  }
}

/** Alle Daten des angemeldeten Nutzers laden (wirft bei jedem Lesefehler). */
async function allesLaden(): Promise<AppDaten> {
  const sb = supabase!;
  const antworten = await Promise.all([
    sb.from("uebungen").select("json"),
    sb.from("medien").select("json"),
    sb.from("trainings").select("json"),
    sb.from("teilnehmer").select("json"),
    sb.from("leistungen").select("json"),
    sb.from("checklisten").select("json"),
    sb.from("stoppuhr_sessions").select("json"),
    sb.from("sportabzeichen").select("json"),
    sb.from("platzplaene").select("json"),
    sb.from("einstellungen").select("key, wert"),
  ]);
  for (const antwort of antworten) {
    if (antwort.error) throw new Error(antwort.error.message);
  }
  const liste = <T,>(i: number) =>
    ((antworten[i].data ?? []) as { json: T }[]).map((z) => z.json);
  return {
    uebungen: liste<Uebung>(0),
    medien: liste<Medium>(1),
    trainings: liste<Training>(2),
    teilnehmer: liste<Teilnehmer>(3),
    leistungen: liste<Leistung>(4),
    checklisten: liste<Checkliste>(5),
    stoppuhrSessions: liste<StoppuhrSession>(6),
    sportabzeichen: liste<SportabzeichenEintrag>(7),
    platzplaene: liste<Platzplan>(8),
    einstellungen: Object.fromEntries(
      ((antworten[9].data ?? []) as unknown as { key: string; wert: unknown }[]).map((z) => [
        z.key,
        z.wert,
      ])
    ),
  };
}

/** Sicherung/Import in die Datenbank schreiben (Medien-Dateien nicht enthalten). */
async function datenSchreiben(daten: Partial<AppDaten>) {
  const sb = supabase!;
  const pruefen = ({ error }: { error: { message: string } | null }, kontext: string) => {
    if (error) throw new Error(`${kontext}: ${error.message}`);
  };
  const jsonZeilen = (objekte?: { id: string }[]) =>
    (objekte ?? []).map((o) => ({ id: o.id, json: o }));

  if (daten.uebungen?.length)
    pruefen(await sb.from("uebungen").upsert(jsonZeilen(daten.uebungen)), "uebungen");
  if (daten.medien?.length)
    pruefen(
      await sb
        .from("medien")
        .upsert(daten.medien.map((m) => ({ id: m.id, uebung_id: m.uebungId, json: m }))),
      "medien"
    );
  if (daten.trainings?.length)
    pruefen(await sb.from("trainings").upsert(jsonZeilen(daten.trainings)), "trainings");
  if (daten.teilnehmer?.length)
    pruefen(await sb.from("teilnehmer").upsert(jsonZeilen(daten.teilnehmer)), "teilnehmer");
  if (daten.leistungen?.length)
    pruefen(
      await sb
        .from("leistungen")
        .upsert(daten.leistungen.map((l) => ({ id: l.id, teilnehmer_id: l.teilnehmerId, json: l }))),
      "leistungen"
    );
  if (daten.checklisten?.length)
    pruefen(await sb.from("checklisten").upsert(jsonZeilen(daten.checklisten)), "checklisten");
  if (daten.stoppuhrSessions?.length)
    pruefen(
      await sb.from("stoppuhr_sessions").upsert(jsonZeilen(daten.stoppuhrSessions)),
      "stoppuhr"
    );
  if (daten.platzplaene?.length)
    pruefen(await sb.from("platzplaene").upsert(jsonZeilen(daten.platzplaene)), "platzplaene");
  if (daten.sportabzeichen?.length)
    pruefen(
      await sb.from("sportabzeichen").upsert(
        daten.sportabzeichen.map((e) => ({
          jahr: e.jahr,
          teilnehmer_id: e.teilnehmerId,
          json: e,
        })),
        { onConflict: "user_id,jahr,teilnehmer_id" }
      ),
      "sportabzeichen"
    );
  if (daten.einstellungen && Object.keys(daten.einstellungen).length > 0)
    pruefen(
      await sb.from("einstellungen").upsert(
        Object.entries(daten.einstellungen).map(([key, wert]) => ({ key, wert })),
        { onConflict: "user_id,key" }
      ),
      "einstellungen"
    );
}

/** Hat der Gast über den Startbestand hinaus etwas angelegt/verändert? */
function hatEigeneInhalte(d: AppDaten): boolean {
  return (
    d.trainings.length > 0 ||
    d.teilnehmer.length > 0 ||
    d.leistungen.length > 0 ||
    d.checklisten.length > 0 ||
    d.stoppuhrSessions.length > 0 ||
    d.sportabzeichen.length > 0 ||
    d.platzplaene.length > 0 ||
    d.medien.length > 0 ||
    Object.keys(d.einstellungen).length > 0 ||
    d.uebungen.some((u) => u.eigene || u.favorit)
  );
}

/** Client-seitiges Zusammenführen (für Import im Gast-Modus). */
function datenZusammenfuehren(basis: AppDaten, teil: Partial<AppDaten>): AppDaten {
  const mischen = <T extends { id: string }>(alt: T[], neu?: T[]): T[] => {
    if (!neu?.length) return alt;
    const map = new Map(alt.map((x) => [x.id, x]));
    for (const n of neu) if (n?.id) map.set(n.id, n);
    return [...map.values()];
  };
  const sportabzeichen = (() => {
    if (!teil.sportabzeichen?.length) return basis.sportabzeichen;
    const map = new Map(
      basis.sportabzeichen.map((x) => [`${x.jahr}|${x.teilnehmerId}`, x])
    );
    for (const n of teil.sportabzeichen) map.set(`${n.jahr}|${n.teilnehmerId}`, n);
    return [...map.values()];
  })();
  return {
    uebungen: mischen(basis.uebungen, teil.uebungen),
    medien: mischen(basis.medien, teil.medien),
    trainings: mischen(basis.trainings, teil.trainings),
    teilnehmer: mischen(basis.teilnehmer, teil.teilnehmer),
    leistungen: mischen(basis.leistungen, teil.leistungen),
    checklisten: mischen(basis.checklisten, teil.checklisten),
    stoppuhrSessions: mischen(basis.stoppuhrSessions, teil.stoppuhrSessions),
    sportabzeichen,
    platzplaene: mischen(basis.platzplaene, teil.platzplaene),
    einstellungen: { ...basis.einstellungen, ...(teil.einstellungen ?? {}) },
  };
}

/** Alle eigenen Zeilen löschen (für Import im Modus "ersetzen"). */
async function allesLoeschen() {
  const sb = supabase!;
  await Promise.all([
    sb.from("uebungen").delete().neq("id", ""),
    sb.from("medien").delete().neq("id", ""),
    sb.from("trainings").delete().neq("id", ""),
    sb.from("teilnehmer").delete().neq("id", ""),
    sb.from("leistungen").delete().neq("id", ""),
    sb.from("checklisten").delete().neq("id", ""),
    sb.from("stoppuhr_sessions").delete().neq("id", ""),
    sb.from("platzplaene").delete().neq("id", ""),
    sb.from("sportabzeichen").delete().neq("teilnehmer_id", ""),
    sb.from("einstellungen").delete().neq("key", ""),
  ]);
}

export function DatenProvider({ children }: { children: ReactNode }) {
  const [daten, setDaten] = useState<AppDaten>(LEER);
  const [bereit, setBereit] = useState(false);
  const [angemeldet, setAngemeldet] = useState(false);
  const [nutzerEmail, setNutzerEmail] = useState<string | null>(null);
  const [entwurf, setEntwurf] = useState<string[]>([]);
  const [offline, setOffline] = useState(false);
  const [wartendeAenderungen, setWartendeAenderungen] = useState(0);

  const [gastModus, setGastModus] = useState(false);
  const geladenFuer = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const gastRef = useRef(false);
  const warteschlange = useRef<SchreibAktion[]>([]);
  const flushLaeuft = useRef(false);

  // ===== Warteschlange =====

  const flushen = useCallback(async () => {
    if (flushLaeuft.current || !userIdRef.current) return;
    flushLaeuft.current = true;
    try {
      while (warteschlange.current.length > 0) {
        const ergebnis = await aktionAusfuehren(warteschlange.current[0]);
        if (ergebnis === "netzfehler") {
          setOffline(true);
          return;
        }
        warteschlange.current.shift();
        warteschlangeSpeichern(userIdRef.current, warteschlange.current);
        setWartendeAenderungen(warteschlange.current.length);
      }
      setOffline(false);
    } finally {
      flushLaeuft.current = false;
    }
  }, []);

  /** Schreibaktion einreihen und sofort versuchen zu synchronisieren. */
  const schreiben = useCallback(
    (aktion: SchreibAktion) => {
      // Gäste schreiben nur in den lokalen Cache (übernimmt der Cache-Effekt).
      if (gastRef.current) return;
      if (!supabase || !userIdRef.current) return;
      warteschlange.current.push(aktion);
      warteschlangeSpeichern(userIdRef.current, warteschlange.current);
      setWartendeAenderungen(warteschlange.current.length);
      void flushen();
    },
    [flushen]
  );

  // ===== Gast-Modus =====

  /** Gast-Modus starten: Daten kommen ausschließlich aus dem lokalen Cache. */
  const gastStarten = useCallback(() => {
    gastRef.current = true;
    userIdRef.current = GAST_ID;
    setGastModus(true);
    const cache = cacheLaden(GAST_ID);
    const start = cache ?? { ...LEER, uebungen: SEED_UEBUNGEN };
    if (!cache) cacheSpeichern(GAST_ID, start);
    setDaten(start);
    setBereit(true);
  }, []);

  const alsGastFortfahren = useCallback(() => {
    try {
      localStorage.setItem(GAST_FLAG, "1");
    } catch {
      // ohne Flag startet der Gast-Modus beim nächsten Laden nicht automatisch
    }
    gastStarten();
  }, [gastStarten]);

  // ===== Start & Anmeldung =====

  useEffect(() => {
    try {
      const merkliste = localStorage.getItem(MERKLISTE_KEY);
      if (merkliste) setEntwurf(JSON.parse(merkliste));
    } catch {
      // Merkliste ist verzichtbar.
    }

    if (!supabase) {
      // Ohne Supabase-Konfiguration funktioniert nur der Gast-Modus.
      if (localStorage.getItem(GAST_FLAG)) gastStarten();
      else setBereit(true);
      return;
    }

    const laden = async (userId: string, email: string | null) => {
      if (geladenFuer.current === userId) return;
      geladenFuer.current = userId;
      userIdRef.current = userId;
      gastRef.current = false;
      setGastModus(false);
      setNutzerEmail(email);

      // 1) Sofortstart aus dem lokalen Cache (auch offline nutzbar).
      const cache = cacheLaden(userId);
      if (cache) {
        setDaten(cache);
        setAngemeldet(true);
        setBereit(true);
      }

      // 2) Offene Änderungen aus früheren Offline-Phasen nachziehen.
      warteschlange.current = warteschlangeLaden(userId);
      setWartendeAenderungen(warteschlange.current.length);
      await flushen();

      // 3) Frischen Stand vom Server holen.
      try {
        let alles = await allesLaden();
        if (alles.uebungen.length === 0) {
          // Erster Login: Übungs-Startbestand einspielen.
          await datenSchreiben({ uebungen: SEED_UEBUNGEN });
          alles = { ...alles, uebungen: SEED_UEBUNGEN };
        }
        // Frühere Gast-Daten dieses Geräts einmalig ins Konto übernehmen.
        const gastDaten = cacheLaden(GAST_ID);
        if (gastDaten) {
          if (hatEigeneInhalte(gastDaten)) {
            await datenSchreiben(gastDaten);
            alles = await allesLaden();
          }
          cacheLoeschen(GAST_ID);
          localStorage.removeItem(GAST_FLAG);
        }
        setDaten(alles);
        cacheSpeichern(userId, alles);
        setOffline(false);
      } catch (e) {
        // Kein Netz (oder Serverfehler): mit Cache weiterarbeiten.
        console.warn("Serverdaten nicht erreichbar – Offline-Modus:", e);
        setOffline(true);
      }
      setAngemeldet(true);
      setBereit(true);
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        void laden(data.session.user.id, data.session.user.email ?? null);
      } else if (localStorage.getItem(GAST_FLAG)) {
        gastStarten();
      } else {
        setBereit(true);
      }
    });

    const { data: abo } = supabase.auth.onAuthStateChange((_ereignis, session) => {
      if (session?.user) {
        void laden(session.user.id, session.user.email ?? null);
      } else if (!gastRef.current) {
        geladenFuer.current = null;
        userIdRef.current = null;
        setAngemeldet(false);
        setNutzerEmail(null);
        setDaten(LEER);
        setBereit(true);
      }
    });

    // Bei Wiederverbindung: Warteschlange nachziehen, dann Serverstand holen.
    const beiOnline = () => {
      void (async () => {
        await flushen();
        if (!userIdRef.current || warteschlange.current.length > 0) return;
        try {
          const alles = await allesLaden();
          setDaten(alles);
          cacheSpeichern(userIdRef.current, alles);
          setOffline(false);
        } catch {
          setOffline(true);
        }
      })();
    };
    const beiOffline = () => setOffline(true);
    window.addEventListener("online", beiOnline);
    window.addEventListener("offline", beiOffline);
    return () => {
      abo.subscription.unsubscribe();
      window.removeEventListener("online", beiOnline);
      window.removeEventListener("offline", beiOffline);
    };
  }, [flushen, gastStarten]);

  // Merkliste sichern
  useEffect(() => {
    if (!bereit) return;
    try {
      localStorage.setItem(MERKLISTE_KEY, JSON.stringify(entwurf));
    } catch {
      // localStorage voll/gesperrt – Merkliste ist verzichtbar.
    }
  }, [entwurf, bereit]);

  // Datencache aktuell halten (macht Lesen offline, Sofortstart und den
  // Gast-Modus möglich – für Gäste ist der Cache der einzige Speicher).
  useEffect(() => {
    if (!bereit || !userIdRef.current) return;
    if (!angemeldet && !gastModus) return;
    cacheSpeichern(userIdRef.current, daten);
  }, [daten, bereit, angemeldet, gastModus]);

  // ===== Konto =====

  const anmeldenMitGoogle = useCallback(() => {
    void supabase?.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const abmelden = useCallback(() => {
    void supabase?.auth.signOut();
  }, []);

  // ===== Generische Upsert/Delete-Helfer =====

  const upsert = useCallback(
    <K extends keyof AppDaten, T extends { id: string }>(
      feld: K,
      tabelle: string,
      objekt: T,
      extraSpalten: Record<string, unknown> = {}
    ) => {
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
      schreiben({
        tabelle,
        typ: "upsert",
        zeile: { id: objekt.id, json: objekt, ...extraSpalten },
      });
    },
    [schreiben]
  );

  const entfernen = useCallback(
    <K extends keyof AppDaten>(feld: K, tabelle: string, id: string) => {
      setDaten((d) => ({
        ...d,
        [feld]: (d[feld] as unknown as { id: string }[]).filter((x) => x.id !== id),
      }));
      schreiben({ tabelle, typ: "loeschen", filter: { id } });
    },
    [schreiben]
  );

  // ===== Übungen & Medien =====

  const uebungSpeichern = useCallback(
    (u: Uebung) => upsert("uebungen", "uebungen", u),
    [upsert]
  );

  const uebungLoeschen = useCallback(
    (id: string) => {
      setDaten((d) => {
        // Zugehörige Speicherdateien bestmöglich mit entfernen.
        const pfade = d.medien
          .filter((m) => m.uebungId === id && m.dateiname?.includes("/"))
          .map((m) => m.dateiname!);
        if (pfade.length > 0) {
          void supabase?.storage.from("medien").remove(pfade);
        }
        return {
          ...d,
          uebungen: d.uebungen.filter((x) => x.id !== id),
          medien: d.medien.filter((m) => m.uebungId !== id),
        };
      });
      setEntwurf((e) => e.filter((x) => x !== id));
      schreiben({ tabelle: "uebungen", typ: "loeschen", filter: { id } });
      schreiben({ tabelle: "medien", typ: "loeschen", filter: { uebung_id: id } });
    },
    [schreiben]
  );

  const favoritUmschalten = useCallback(
    (id: string) => {
      setDaten((d) => {
        const u = d.uebungen.find((x) => x.id === id);
        if (!u) return d;
        const neu = { ...u, favorit: !u.favorit };
        schreiben({ tabelle: "uebungen", typ: "upsert", zeile: { id: neu.id, json: neu } });
        return { ...d, uebungen: d.uebungen.map((x) => (x.id === id ? neu : x)) };
      });
    },
    [schreiben]
  );

  const mediumHochladen = useCallback(
    async (uebungId: string, datei: File, reihenfolge: number): Promise<Medium | null> => {
      // Datei-Uploads brauchen ein Konto (Storage-Rechte) – Gäste nutzen YouTube-Links.
      if (gastRef.current) return null;
      if (!supabase || !userIdRef.current) return null;
      const endung = (datei.name.split(".").pop() ?? "bin").toLowerCase();
      const istVideo = ["mp4", "webm", "mov", "m4v"].includes(endung);
      const pfad = `${userIdRef.current}/${neueId()}.${endung}`;
      try {
        const { error } = await supabase.storage.from("medien").upload(pfad, datei);
        if (error) {
          console.error("Upload fehlgeschlagen:", error.message);
          return null;
        }
      } catch (e) {
        // Datei-Uploads brauchen eine Verbindung – bewusst nicht eingereiht.
        console.error("Upload fehlgeschlagen (offline?):", e);
        return null;
      }
      const medium: Medium = {
        id: neueId(),
        uebungId,
        typ: istVideo ? "video" : "bild",
        dateiname: pfad,
        reihenfolge,
      };
      setDaten((d) => ({ ...d, medien: [...d.medien, medium] }));
      schreiben({
        tabelle: "medien",
        typ: "upsert",
        zeile: { id: medium.id, uebung_id: uebungId, json: medium },
      });
      return medium;
    },
    [schreiben]
  );

  const mediumSpeichern = useCallback(
    (m: Medium) => upsert("medien", "medien", m, { uebung_id: m.uebungId }),
    [upsert]
  );

  const mediumLoeschen = useCallback(
    (id: string) => {
      setDaten((d) => {
        const m = d.medien.find((x) => x.id === id);
        if (m?.dateiname?.includes("/")) {
          void supabase?.storage.from("medien").remove([m.dateiname]);
        }
        return { ...d, medien: d.medien.filter((x) => x.id !== id) };
      });
      schreiben({ tabelle: "medien", typ: "loeschen", filter: { id } });
    },
    [schreiben]
  );

  // ===== Übrige Entitäten =====

  const trainingSpeichern = useCallback(
    (t: Training) => upsert("trainings", "trainings", t),
    [upsert]
  );
  const trainingLoeschen = useCallback(
    (id: string) => entfernen("trainings", "trainings", id),
    [entfernen]
  );

  const teilnehmerSpeichern = useCallback(
    (t: Teilnehmer) => upsert("teilnehmer", "teilnehmer", t),
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
      schreiben({ tabelle: "teilnehmer", typ: "loeschen", filter: { id } });
      schreiben({ tabelle: "leistungen", typ: "loeschen", filter: { teilnehmer_id: id } });
      schreiben({ tabelle: "sportabzeichen", typ: "loeschen", filter: { teilnehmer_id: id } });
    },
    [schreiben]
  );

  const leistungSpeichern = useCallback(
    (l: Leistung) => upsert("leistungen", "leistungen", l, { teilnehmer_id: l.teilnehmerId }),
    [upsert]
  );
  const leistungLoeschen = useCallback(
    (id: string) => entfernen("leistungen", "leistungen", id),
    [entfernen]
  );

  const checklisteSpeichern = useCallback(
    (c: Checkliste) => upsert("checklisten", "checklisten", c),
    [upsert]
  );
  const checklisteLoeschen = useCallback(
    (id: string) => entfernen("checklisten", "checklisten", id),
    [entfernen]
  );

  const stoppuhrSessionSpeichern = useCallback(
    (s: StoppuhrSession) => upsert("stoppuhrSessions", "stoppuhr_sessions", s),
    [upsert]
  );
  const stoppuhrSessionLoeschen = useCallback(
    (id: string) => entfernen("stoppuhrSessions", "stoppuhr_sessions", id),
    [entfernen]
  );

  const platzplanSpeichern = useCallback(
    (p: Platzplan) => upsert("platzplaene", "platzplaene", p),
    [upsert]
  );
  const platzplanLoeschen = useCallback(
    (id: string) => entfernen("platzplaene", "platzplaene", id),
    [entfernen]
  );

  const sportabzeichenSpeichern = useCallback(
    (e: SportabzeichenEintrag) => {
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
      schreiben({
        tabelle: "sportabzeichen",
        typ: "upsert",
        zeile: { jahr: e.jahr, teilnehmer_id: e.teilnehmerId, json: e },
        onConflict: "user_id,jahr,teilnehmer_id",
      });
    },
    [schreiben]
  );

  const sportabzeichenLoeschen = useCallback(
    (jahr: number, teilnehmerId: string) => {
      setDaten((d) => ({
        ...d,
        sportabzeichen: d.sportabzeichen.filter(
          (x) => !(x.jahr === jahr && x.teilnehmerId === teilnehmerId)
        ),
      }));
      schreiben({
        tabelle: "sportabzeichen",
        typ: "loeschen",
        filter: { jahr, teilnehmer_id: teilnehmerId },
      });
    },
    [schreiben]
  );

  const einstellungSetzen = useCallback(
    (key: string, wert: unknown) => {
      setDaten((d) => ({ ...d, einstellungen: { ...d.einstellungen, [key]: wert } }));
      schreiben({
        tabelle: "einstellungen",
        typ: "upsert",
        zeile: { key, wert },
        onConflict: "user_id,key",
      });
    },
    [schreiben]
  );

  // ===== Merkliste =====

  const entwurfUmschalten = useCallback((uebungId: string) => {
    setEntwurf((e) =>
      e.includes(uebungId) ? e.filter((x) => x !== uebungId) : [...e, uebungId]
    );
  }, []);

  const entwurfLeeren = useCallback(() => setEntwurf([]), []);

  // ===== Import / Übernahme (brauchen eine Verbindung) =====

  const datenImportieren = useCallback(
    async (json: string, modus: "ersetzen" | "zusammenfuehren"): Promise<string | null> => {
      let geparst: Partial<AppDaten>;
      try {
        geparst = JSON.parse(json) as Partial<AppDaten>;
      } catch {
        return "Die Datei ist kein gültiges JSON.";
      }
      if (!geparst || typeof geparst !== "object") {
        return "Die Datei hat nicht das erwartete Format.";
      }
      // Gäste importieren rein lokal (der Cache-Effekt speichert das Ergebnis).
      if (gastRef.current) {
        setDaten((d) => datenZusammenfuehren(modus === "ersetzen" ? LEER : d, geparst));
        return null;
      }
      if (!supabase) return "Supabase ist nicht konfiguriert.";
      try {
        if (modus === "ersetzen") await allesLoeschen();
        await datenSchreiben(geparst);
        const alles = await allesLaden();
        setDaten(alles);
        if (userIdRef.current) cacheSpeichern(userIdRef.current, alles);
        return null;
      } catch (e) {
        console.error("Import fehlgeschlagen:", e);
        return istNetzwerkFehler((e as Error).message)
          ? "Keine Verbindung – der Import braucht Internet."
          : "Der Import ist fehlgeschlagen.";
      }
    },
    []
  );

  const wert = useMemo<StoreWert>(
    () => ({
      bereit,
      daten,
      entwurf,
      konfigFehlt: !supabaseKonfiguriert,
      angemeldet,
      nutzerEmail,
      anmeldenMitGoogle,
      abmelden,
      gastModus,
      alsGastFortfahren,
      offline,
      wartendeAenderungen,
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
      angemeldet,
      nutzerEmail,
      anmeldenMitGoogle,
      abmelden,
      gastModus,
      alsGastFortfahren,
      offline,
      wartendeAenderungen,
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

/** URL, unter der eine Mediendatei erreichbar ist (Supabase-Storage). */
export function mediumUrl(m: Medium): string {
  if (m.typ === "youtube") return m.url ?? "";
  if (!m.dateiname) return "";
  return storageUrl(m.dateiname);
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
