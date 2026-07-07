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
import { SEED_UEBUNGEN } from "./seed";

// Zugriffsschicht des Clients: Supabase (Postgres + Storage + Google-Login).
// Der Gesamtzustand wird einmal geladen und im Speicher gehalten; Mutationen
// aktualisieren den lokalen Zustand sofort und schreiben parallel in die
// Datenbank. Row Level Security sorgt dafür, dass jeder Account nur die
// eigenen Daten sieht.

const MERKLISTE_KEY = "nachwuchscoach-merkliste";

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
  lokaleDatenUebernehmen: () => Promise<string | null>;
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

function fehlerLoggen(kontext: string) {
  return ({ error }: { error: { message: string } | null }) => {
    if (error) console.error(`Supabase-Fehler (${kontext}):`, error.message);
  };
}

/** Alle Daten des angemeldeten Nutzers laden. */
async function allesLaden(): Promise<AppDaten> {
  const sb = supabase!;
  const [
    uebungen,
    medien,
    trainings,
    teilnehmer,
    leistungen,
    checklisten,
    stoppuhr,
    sportabzeichen,
    plaene,
    einstellungen,
  ] = await Promise.all([
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
  const liste = <T,>(res: { data: { json: T }[] | null }) =>
    (res.data ?? []).map((z) => z.json);
  return {
    uebungen: liste<Uebung>(uebungen),
    medien: liste<Medium>(medien),
    trainings: liste<Training>(trainings),
    teilnehmer: liste<Teilnehmer>(teilnehmer),
    leistungen: liste<Leistung>(leistungen),
    checklisten: liste<Checkliste>(checklisten),
    stoppuhrSessions: liste<StoppuhrSession>(stoppuhr),
    sportabzeichen: liste<SportabzeichenEintrag>(sportabzeichen),
    platzplaene: liste<Platzplan>(plaene),
    einstellungen: Object.fromEntries(
      (einstellungen.data ?? []).map((z) => [z.key, z.wert])
    ),
  };
}

/** Sicherung/Import in die Datenbank schreiben (Medien-Dateien nicht enthalten). */
async function datenSchreiben(daten: Partial<AppDaten>) {
  const sb = supabase!;
  const jsonZeilen = (objekte?: { id: string }[]) =>
    (objekte ?? []).map((o) => ({ id: o.id, json: o }));

  if (daten.uebungen?.length)
    fehlerLoggen("uebungen")(await sb.from("uebungen").upsert(jsonZeilen(daten.uebungen)));
  if (daten.medien?.length)
    fehlerLoggen("medien")(
      await sb
        .from("medien")
        .upsert(daten.medien.map((m) => ({ id: m.id, uebung_id: m.uebungId, json: m })))
    );
  if (daten.trainings?.length)
    fehlerLoggen("trainings")(await sb.from("trainings").upsert(jsonZeilen(daten.trainings)));
  if (daten.teilnehmer?.length)
    fehlerLoggen("teilnehmer")(await sb.from("teilnehmer").upsert(jsonZeilen(daten.teilnehmer)));
  if (daten.leistungen?.length)
    fehlerLoggen("leistungen")(
      await sb
        .from("leistungen")
        .upsert(daten.leistungen.map((l) => ({ id: l.id, teilnehmer_id: l.teilnehmerId, json: l })))
    );
  if (daten.checklisten?.length)
    fehlerLoggen("checklisten")(await sb.from("checklisten").upsert(jsonZeilen(daten.checklisten)));
  if (daten.stoppuhrSessions?.length)
    fehlerLoggen("stoppuhr")(
      await sb.from("stoppuhr_sessions").upsert(jsonZeilen(daten.stoppuhrSessions))
    );
  if (daten.platzplaene?.length)
    fehlerLoggen("platzplaene")(await sb.from("platzplaene").upsert(jsonZeilen(daten.platzplaene)));
  if (daten.sportabzeichen?.length)
    fehlerLoggen("sportabzeichen")(
      await sb.from("sportabzeichen").upsert(
        daten.sportabzeichen.map((e) => ({
          jahr: e.jahr,
          teilnehmer_id: e.teilnehmerId,
          json: e,
        })),
        { onConflict: "user_id,jahr,teilnehmer_id" }
      )
    );
  if (daten.einstellungen)
    fehlerLoggen("einstellungen")(
      await sb.from("einstellungen").upsert(
        Object.entries(daten.einstellungen).map(([key, wert]) => ({ key, wert })),
        { onConflict: "user_id,key" }
      )
    );
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
  const geladenFuer = useRef<string | null>(null);

  useEffect(() => {
    try {
      const merkliste = localStorage.getItem(MERKLISTE_KEY);
      if (merkliste) setEntwurf(JSON.parse(merkliste));
    } catch {
      // Merkliste ist verzichtbar.
    }

    if (!supabase) {
      setBereit(true);
      return;
    }

    const laden = async (userId: string, email: string | null) => {
      if (geladenFuer.current === userId) return;
      geladenFuer.current = userId;
      setNutzerEmail(email);
      try {
        let alles = await allesLaden();
        // Erster Login: Übungs-Startbestand einspielen.
        if (alles.uebungen.length === 0) {
          await datenSchreiben({ uebungen: SEED_UEBUNGEN });
          alles = { ...alles, uebungen: SEED_UEBUNGEN };
        }
        setDaten(alles);
        setAngemeldet(true);
      } catch (e) {
        console.error("Daten konnten nicht geladen werden:", e);
      }
      setBereit(true);
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        void laden(data.session.user.id, data.session.user.email ?? null);
      } else {
        setBereit(true);
      }
    });

    const { data: abo } = supabase.auth.onAuthStateChange((_ereignis, session) => {
      if (session?.user) {
        void laden(session.user.id, session.user.email ?? null);
      } else {
        geladenFuer.current = null;
        setAngemeldet(false);
        setNutzerEmail(null);
        setDaten(LEER);
        setBereit(true);
      }
    });
    return () => abo.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!bereit) return;
    try {
      localStorage.setItem(MERKLISTE_KEY, JSON.stringify(entwurf));
    } catch {
      // localStorage voll/gesperrt – Merkliste ist verzichtbar.
    }
  }, [entwurf, bereit]);

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
      void supabase
        ?.from(tabelle)
        .upsert({ id: objekt.id, json: objekt, ...extraSpalten })
        .then(fehlerLoggen(tabelle));
    },
    []
  );

  const entfernen = useCallback(
    <K extends keyof AppDaten>(feld: K, tabelle: string, id: string) => {
      setDaten((d) => ({
        ...d,
        [feld]: (d[feld] as unknown as { id: string }[]).filter((x) => x.id !== id),
      }));
      void supabase?.from(tabelle).delete().eq("id", id).then(fehlerLoggen(tabelle));
    },
    []
  );

  // ===== Übungen & Medien =====

  const uebungSpeichern = useCallback(
    (u: Uebung) => upsert("uebungen", "uebungen", u),
    [upsert]
  );

  const uebungLoeschen = useCallback((id: string) => {
    setDaten((d) => {
      // Zugehörige Mediendateien im Storage mit entfernen.
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
    void supabase?.from("uebungen").delete().eq("id", id).then(fehlerLoggen("uebungen"));
    void supabase?.from("medien").delete().eq("uebung_id", id).then(fehlerLoggen("medien"));
  }, []);

  const favoritUmschalten = useCallback((id: string) => {
    setDaten((d) => {
      const u = d.uebungen.find((x) => x.id === id);
      if (u) {
        const neu = { ...u, favorit: !u.favorit };
        void supabase
          ?.from("uebungen")
          .upsert({ id: neu.id, json: neu })
          .then(fehlerLoggen("uebungen"));
        return {
          ...d,
          uebungen: d.uebungen.map((x) => (x.id === id ? neu : x)),
        };
      }
      return d;
    });
  }, []);

  const mediumHochladen = useCallback(
    async (uebungId: string, datei: File, reihenfolge: number): Promise<Medium | null> => {
      if (!supabase) return null;
      const { data: sessionDaten } = await supabase.auth.getUser();
      const userId = sessionDaten.user?.id;
      if (!userId) return null;
      const endung = (datei.name.split(".").pop() ?? "bin").toLowerCase();
      const istVideo = ["mp4", "webm", "mov", "m4v"].includes(endung);
      const pfad = `${userId}/${neueId()}.${endung}`;
      const { error } = await supabase.storage.from("medien").upload(pfad, datei);
      if (error) {
        console.error("Upload fehlgeschlagen:", error.message);
        return null;
      }
      const medium: Medium = {
        id: neueId(),
        uebungId,
        typ: istVideo ? "video" : "bild",
        dateiname: pfad,
        reihenfolge,
      };
      fehlerLoggen("medien")(
        await supabase.from("medien").upsert({ id: medium.id, uebung_id: uebungId, json: medium })
      );
      setDaten((d) => ({ ...d, medien: [...d.medien, medium] }));
      return medium;
    },
    []
  );

  const mediumSpeichern = useCallback(
    (m: Medium) => upsert("medien", "medien", m, { uebung_id: m.uebungId }),
    [upsert]
  );

  const mediumLoeschen = useCallback((id: string) => {
    setDaten((d) => {
      const m = d.medien.find((x) => x.id === id);
      if (m?.dateiname?.includes("/")) {
        void supabase?.storage.from("medien").remove([m.dateiname]);
      }
      return { ...d, medien: d.medien.filter((x) => x.id !== id) };
    });
    void supabase?.from("medien").delete().eq("id", id).then(fehlerLoggen("medien"));
  }, []);

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
  const teilnehmerLoeschen = useCallback((id: string) => {
    setDaten((d) => ({
      ...d,
      teilnehmer: d.teilnehmer.filter((x) => x.id !== id),
      leistungen: d.leistungen.filter((l) => l.teilnehmerId !== id),
      sportabzeichen: d.sportabzeichen.filter((s) => s.teilnehmerId !== id),
    }));
    void supabase?.from("teilnehmer").delete().eq("id", id).then(fehlerLoggen("teilnehmer"));
    void supabase
      ?.from("leistungen")
      .delete()
      .eq("teilnehmer_id", id)
      .then(fehlerLoggen("leistungen"));
    void supabase
      ?.from("sportabzeichen")
      .delete()
      .eq("teilnehmer_id", id)
      .then(fehlerLoggen("sportabzeichen"));
  }, []);

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
    void supabase
      ?.from("sportabzeichen")
      .upsert(
        { jahr: e.jahr, teilnehmer_id: e.teilnehmerId, json: e },
        { onConflict: "user_id,jahr,teilnehmer_id" }
      )
      .then(fehlerLoggen("sportabzeichen"));
  }, []);

  const sportabzeichenLoeschen = useCallback((jahr: number, teilnehmerId: string) => {
    setDaten((d) => ({
      ...d,
      sportabzeichen: d.sportabzeichen.filter(
        (x) => !(x.jahr === jahr && x.teilnehmerId === teilnehmerId)
      ),
    }));
    void supabase
      ?.from("sportabzeichen")
      .delete()
      .eq("jahr", jahr)
      .eq("teilnehmer_id", teilnehmerId)
      .then(fehlerLoggen("sportabzeichen"));
  }, []);

  const einstellungSetzen = useCallback((key: string, wert: unknown) => {
    setDaten((d) => ({ ...d, einstellungen: { ...d.einstellungen, [key]: wert } }));
    void supabase
      ?.from("einstellungen")
      .upsert({ key, wert }, { onConflict: "user_id,key" })
      .then(fehlerLoggen("einstellungen"));
  }, []);

  // ===== Merkliste =====

  const entwurfUmschalten = useCallback((uebungId: string) => {
    setEntwurf((e) =>
      e.includes(uebungId) ? e.filter((x) => x !== uebungId) : [...e, uebungId]
    );
  }, []);

  const entwurfLeeren = useCallback(() => setEntwurf([]), []);

  // ===== Import / Übernahme =====

  const datenImportieren = useCallback(
    async (json: string, modus: "ersetzen" | "zusammenfuehren"): Promise<string | null> => {
      if (!supabase) return "Supabase ist nicht konfiguriert.";
      let geparst: Partial<AppDaten>;
      try {
        geparst = JSON.parse(json) as Partial<AppDaten>;
      } catch {
        return "Die Datei ist kein gültiges JSON.";
      }
      if (!geparst || typeof geparst !== "object") {
        return "Die Datei hat nicht das erwartete Format.";
      }
      try {
        if (modus === "ersetzen") await allesLoeschen();
        await datenSchreiben(geparst);
        setDaten(await allesLaden());
        return null;
      } catch (e) {
        console.error("Import fehlgeschlagen:", e);
        return "Der Import ist fehlgeschlagen.";
      }
    },
    []
  );

  /**
   * Einmalige Übernahme der alten lokalen SQLite-Daten (inkl. Mediendateien).
   * Funktioniert nur am PC, auf dem die alte Version lief – dort liefert die
   * alte API-Route /api/export noch die Daten und /api/medien/datei die Dateien.
   */
  const lokaleDatenUebernehmen = useCallback(async (): Promise<string | null> => {
    if (!supabase) return "Supabase ist nicht konfiguriert.";
    const { data: sessionDaten } = await supabase.auth.getUser();
    const userId = sessionDaten.user?.id;
    if (!userId) return "Nicht angemeldet.";

    let alt: AppDaten;
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error(String(res.status));
      alt = (await res.json()) as AppDaten;
    } catch {
      return "Keine lokalen Daten gefunden. Die Übernahme funktioniert nur am PC mit der alten lokalen Datenbank (npm run dev).";
    }

    // Mediendateien vom alten lokalen Speicher in den Supabase-Storage heben.
    let uebertragen = 0;
    for (const m of alt.medien ?? []) {
      if (!m.dateiname || m.dateiname.includes("/")) continue;
      try {
        const dres = await fetch(`/api/medien/datei/${m.dateiname}`);
        if (!dres.ok) continue;
        const blob = await dres.blob();
        const pfad = `${userId}/${m.dateiname}`;
        const { error } = await supabase.storage
          .from("medien")
          .upload(pfad, blob, { upsert: true });
        if (!error) {
          m.dateiname = pfad;
          uebertragen++;
        }
      } catch {
        // Einzelne Datei fehlt – Rest trotzdem übernehmen.
      }
    }

    try {
      await datenSchreiben(alt);
      setDaten(await allesLaden());
    } catch (e) {
      console.error("Übernahme fehlgeschlagen:", e);
      return "Die Übernahme ist fehlgeschlagen.";
    }
    console.info(`Lokale Daten übernommen (${uebertragen} Mediendateien).`);
    return null;
  }, []);

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
      lokaleDatenUebernehmen,
    }),
    [
      bereit,
      daten,
      entwurf,
      angemeldet,
      nutzerEmail,
      anmeldenMitGoogle,
      abmelden,
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
      lokaleDatenUebernehmen,
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

/** URL, unter der eine Mediendatei erreichbar ist. */
export function mediumUrl(m: Medium): string {
  if (m.typ === "youtube") return m.url ?? "";
  if (!m.dateiname) return "";
  // Neue Medien liegen im Supabase-Storage (Pfad mit "/"), alte noch in der
  // lokalen SQLite-Version – bis zur Übernahme über die alte Route ausliefern.
  return m.dateiname.includes("/")
    ? storageUrl(m.dateiname)
    : `/api/medien/datei/${m.dateiname}`;
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
