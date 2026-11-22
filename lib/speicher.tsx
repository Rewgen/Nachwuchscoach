"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LEERER_FILTER, type Filter } from "./katalog";
import type { MerkEintrag } from "./types";
import { uebungNachId } from "./uebungen";

// Alles bleibt auf dem Gerät (localStorage). Der Filter lebt nur im Speicher,
// überdauert aber den Wechsel zwischen Katalog und Detailseite.

const SCHLUESSEL = {
  favoriten: "nwc-favoriten",
  merkliste: "nwc-merkliste",
  fehlendesMaterial: "nwc-fehlendes-material",
  trainingDatum: "nwc-training-datum",
};

function lesen<T>(schluessel: string, standard: T): T {
  try {
    const roh = localStorage.getItem(schluessel);
    return roh ? (JSON.parse(roh) as T) : standard;
  } catch {
    return standard;
  }
}

function schreiben(schluessel: string, wert: unknown) {
  try {
    localStorage.setItem(schluessel, JSON.stringify(wert));
  } catch {
    // Speicher voll oder gesperrt (privater Modus) – App funktioniert trotzdem.
  }
}

interface Speicher {
  bereit: boolean;
  favoriten: Set<string>;
  favoritUmschalten: (id: string) => void;
  merkliste: MerkEintrag[];
  aufMerkliste: (id: string) => boolean;
  merkUmschalten: (id: string) => void;
  merkEntfernen: (id: string) => void;
  merkTauschen: (a: string, b: string) => void;
  merkErledigt: (id: string) => void;
  merklisteSetzen: (ids: string[]) => void;
  merklisteLeeren: () => void;
  trainingDatum: string;
  setTrainingDatum: (d: string) => void;
  fehlendesMaterial: Set<string>;
  materialUmschalten: (m: string) => void;
  filter: Filter;
  setFilter: (f: Filter | ((alt: Filter) => Filter)) => void;
}

const Kontext = createContext<Speicher | null>(null);

export function SpeicherProvider({ children }: { children: React.ReactNode }) {
  const [bereit, setBereit] = useState(false);
  const [favoriten, setFavoriten] = useState<string[]>([]);
  const [merkliste, setMerkliste] = useState<MerkEintrag[]>([]);
  const [fehlend, setFehlend] = useState<string[]>([]);
  const [trainingDatum, setTrainingDatumState] = useState("");
  const [filter, setFilter] = useState<Filter>(LEERER_FILTER);

  useEffect(() => {
    setFavoriten(lesen<string[]>(SCHLUESSEL.favoriten, []));
    setMerkliste(
      lesen<MerkEintrag[]>(SCHLUESSEL.merkliste, []).filter((e) => uebungNachId(e.id))
    );
    setFehlend(lesen<string[]>(SCHLUESSEL.fehlendesMaterial, []));
    setTrainingDatumState(lesen<string>(SCHLUESSEL.trainingDatum, ""));
    setBereit(true);
  }, []);

  useEffect(() => {
    if (bereit) schreiben(SCHLUESSEL.favoriten, favoriten);
  }, [bereit, favoriten]);
  useEffect(() => {
    if (bereit) schreiben(SCHLUESSEL.merkliste, merkliste);
  }, [bereit, merkliste]);
  useEffect(() => {
    if (bereit) schreiben(SCHLUESSEL.fehlendesMaterial, fehlend);
  }, [bereit, fehlend]);
  useEffect(() => {
    if (bereit) schreiben(SCHLUESSEL.trainingDatum, trainingDatum);
  }, [bereit, trainingDatum]);

  const favoritUmschalten = useCallback((id: string) => {
    setFavoriten((alt) => (alt.includes(id) ? alt.filter((x) => x !== id) : [...alt, id]));
  }, []);

  const merkUmschalten = useCallback((id: string) => {
    setMerkliste((alt) =>
      alt.some((e) => e.id === id)
        ? alt.filter((e) => e.id !== id)
        : [...alt, { id, erledigt: false }]
    );
  }, []);

  const merkEntfernen = useCallback((id: string) => {
    setMerkliste((alt) => alt.filter((e) => e.id !== id));
  }, []);

  const merkTauschen = useCallback((a: string, b: string) => {
    setMerkliste((alt) => {
      const i = alt.findIndex((e) => e.id === a);
      const j = alt.findIndex((e) => e.id === b);
      if (i < 0 || j < 0) return alt;
      const neu = [...alt];
      [neu[i], neu[j]] = [neu[j], neu[i]];
      return neu;
    });
  }, []);

  const merkErledigt = useCallback((id: string) => {
    setMerkliste((alt) => alt.map((e) => (e.id === id ? { ...e, erledigt: !e.erledigt } : e)));
  }, []);

  const merklisteSetzen = useCallback((ids: string[]) => {
    setMerkliste(
      [...new Set(ids)].filter((id) => uebungNachId(id)).map((id) => ({ id, erledigt: false }))
    );
  }, []);

  const materialUmschalten = useCallback((m: string) => {
    setFehlend((alt) => (alt.includes(m) ? alt.filter((x) => x !== m) : [...alt, m]));
  }, []);

  const wert = useMemo<Speicher>(() => {
    const merkIds = new Set(merkliste.map((e) => e.id));
    return {
      bereit,
      favoriten: new Set(favoriten),
      favoritUmschalten,
      merkliste,
      aufMerkliste: (id) => merkIds.has(id),
      merkUmschalten,
      merkEntfernen,
      merkTauschen,
      merkErledigt,
      merklisteSetzen,
      merklisteLeeren: () => setMerkliste([]),
      trainingDatum,
      setTrainingDatum: setTrainingDatumState,
      fehlendesMaterial: new Set(fehlend),
      materialUmschalten,
      filter,
      setFilter,
    };
  }, [
    bereit,
    favoriten,
    merkliste,
    fehlend,
    trainingDatum,
    filter,
    favoritUmschalten,
    merkUmschalten,
    merkEntfernen,
    merkTauschen,
    merkErledigt,
    merklisteSetzen,
    materialUmschalten,
  ]);

  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}

export function useSpeicher(): Speicher {
  const k = useContext(Kontext);
  if (!k) throw new Error("useSpeicher außerhalb von SpeicherProvider");
  return k;
}
