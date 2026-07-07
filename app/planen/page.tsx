"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Wand2,
  X,
} from "lucide-react";
import type { Anlage, Disziplin, Ort, Training, TrainingsEintrag } from "@/lib/types";
import { ABSCHNITTE, ANLAGEN, DISZIPLINEN, heuteISO } from "@/lib/labels";
import { neueId, useDaten } from "@/lib/store";
import { trainingGenerieren } from "@/lib/generator";
import UebungPicker from "@/components/UebungPicker";
import {
  AbschnittBadge,
  Badge,
  Feld,
  LeererHinweis,
  SeitenKopf,
  eingabeKlasse,
  karteKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

export default function PlanenSeite() {
  return (
    <Suspense fallback={null}>
      <TrainingsPlaner />
    </Suspense>
  );
}

const ABSCHNITT_REIHENFOLGE = ABSCHNITTE.map((a) => a.wert);

function TrainingsPlaner() {
  const router = useRouter();
  const params = useSearchParams();
  const bearbeitenId = params.get("id");
  const vorlageId = params.get("vorlage");
  const { daten, bereit, entwurf, trainingSpeichern, entwurfLeeren } = useDaten();

  const [titel, setTitel] = useState("");
  const [datum, setDatum] = useState(heuteISO());
  const [gruppe, setGruppe] = useState("");
  const [teilnehmer, setTeilnehmer] = useState("");
  const [ort, setOrt] = useState<Ort | "">("");
  const [schwerpunkt, setSchwerpunkt] = useState<Disziplin | "">("");
  const [notizen, setNotizen] = useState("");
  const [eintraege, setEintraege] = useState<TrainingsEintrag[]>([]);
  const [geladen, setGeladen] = useState(false);
  const [ausMerkliste, setAusMerkliste] = useState(false);

  // Formular initialisieren: bestehendes Training, Vorlage oder Merkliste.
  useEffect(() => {
    if (!bereit || geladen) return;
    const quelle = bearbeitenId
      ? daten.trainings.find((t) => t.id === bearbeitenId)
      : vorlageId
        ? daten.trainings.find((t) => t.id === vorlageId)
        : undefined;

    if (quelle) {
      setTitel(bearbeitenId ? quelle.titel : "");
      setDatum(bearbeitenId ? quelle.datum : heuteISO());
      setGruppe(quelle.gruppe ?? "");
      setTeilnehmer(quelle.teilnehmerAnzahl ? String(quelle.teilnehmerAnzahl) : "");
      setOrt(quelle.ort ?? "");
      setSchwerpunkt(quelle.schwerpunkt ?? "");
      setNotizen(bearbeitenId ? (quelle.notizen ?? "") : "");
      setEintraege(
        quelle.eintraege.map((e) =>
          bearbeitenId ? e : { uebungId: e.uebungId, dauer: e.dauer }
        )
      );
    } else if (entwurf.length > 0) {
      const neu: TrainingsEintrag[] = [...entwurf]
        .map((id) => daten.uebungen.find((u) => u.id === id))
        .filter((u) => u !== undefined)
        .sort(
          (a, b) =>
            ABSCHNITT_REIHENFOLGE.indexOf(a.abschnitt) -
            ABSCHNITT_REIHENFOLGE.indexOf(b.abschnitt)
        )
        .map((u) => ({ uebungId: u.id, dauer: u.dauer }));
      setEintraege(neu);
      setAusMerkliste(true);
    }
    setGeladen(true);
  }, [bereit, geladen, bearbeitenId, vorlageId, daten, entwurf]);

  const gesamtdauer = useMemo(
    () => eintraege.reduce((summe, e) => summe + (e.dauer || 0), 0),
    [eintraege]
  );

  const material = useMemo(() => {
    const menge = new Set<string>();
    for (const e of eintraege) {
      daten.uebungen.find((u) => u.id === e.uebungId)?.material.forEach((m) => menge.add(m));
    }
    return [...menge].sort((a, b) => a.localeCompare(b, "de"));
  }, [eintraege, daten.uebungen]);

  function hinzufuegen(uebungId: string) {
    const u = daten.uebungen.find((x) => x.id === uebungId);
    if (!u) return;
    const neuer: TrainingsEintrag = { uebungId, dauer: u.dauer };
    const ordnung = ABSCHNITT_REIHENFOLGE.indexOf(u.abschnitt);
    setEintraege((alt) => {
      let einfuegeIndex = alt.length;
      for (let i = alt.length - 1; i >= 0; i--) {
        const andere = daten.uebungen.find((x) => x.id === alt[i].uebungId);
        const andereOrdnung = andere ? ABSCHNITT_REIHENFOLGE.indexOf(andere.abschnitt) : 0;
        if (andereOrdnung <= ordnung) {
          einfuegeIndex = i + 1;
          break;
        }
        einfuegeIndex = i;
      }
      return [...alt.slice(0, einfuegeIndex), neuer, ...alt.slice(einfuegeIndex)];
    });
  }

  function verschieben(index: number, richtung: -1 | 1) {
    setEintraege((alt) => {
      const ziel = index + richtung;
      if (ziel < 0 || ziel >= alt.length) return alt;
      const kopie = [...alt];
      [kopie[index], kopie[ziel]] = [kopie[ziel], kopie[index]];
      return kopie;
    });
  }

  function aktualisieren(index: number, aenderung: Partial<TrainingsEintrag>) {
    setEintraege((alt) => alt.map((e, i) => (i === index ? { ...e, ...aenderung } : e)));
  }

  function speichern() {
    if (eintraege.length === 0) return;
    const bestehend = bearbeitenId
      ? daten.trainings.find((t) => t.id === bearbeitenId)
      : undefined;
    const training: Training = {
      id: bestehend?.id ?? neueId(),
      titel: titel.trim() || `Training am ${datum.split("-").reverse().join(".")}`,
      datum,
      gruppe: gruppe.trim() || undefined,
      teilnehmerAnzahl: parseInt(teilnehmer, 10) || undefined,
      ort: ort || undefined,
      schwerpunkt: schwerpunkt || undefined,
      eintraege,
      notizen: notizen.trim() || undefined,
      status: bestehend?.status ?? "geplant",
      reflexion: bestehend?.reflexion,
      erstelltAm: bestehend?.erstelltAm ?? new Date().toISOString(),
    };
    trainingSpeichern(training);
    if (ausMerkliste) entwurfLeeren();
    router.push(`/trainings/ansicht?id=${training.id}`);
  }

  if (!bereit || !geladen) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <SeitenKopf
        titel={bearbeitenId ? "Training bearbeiten" : "Training planen"}
        beschreibung={
          ausMerkliste
            ? `${eintraege.length} gemerkte Übungen wurden übernommen.`
            : vorlageId
              ? "Übungen aus dem alten Training übernommen – Datum und Titel sind neu."
              : undefined
        }
      />

      {/* Eckdaten */}
      <div className={`${karteKlasse} p-4`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Feld label="Titel">
            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder={`Training am ${datum.split("-").reverse().join(".")}`}
              className={eingabeKlasse}
            />
          </Feld>
          <Feld label="Datum">
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className={eingabeKlasse}
            />
          </Feld>
          <Feld label="Gruppe">
            <input
              value={gruppe}
              onChange={(e) => setGruppe(e.target.value)}
              placeholder="z. B. U10"
              className={eingabeKlasse}
            />
          </Feld>
          <Feld label="Erwartete Kinder">
            <input
              type="number"
              min={1}
              value={teilnehmer}
              onChange={(e) => setTeilnehmer(e.target.value)}
              placeholder="z. B. 12"
              className={eingabeKlasse}
            />
          </Feld>
          <Feld label="Ort">
            <select
              value={ort}
              onChange={(e) => setOrt(e.target.value as Ort | "")}
              className={eingabeKlasse}
            >
              <option value="">–</option>
              <option value="draussen">Draußen (Platz)</option>
              <option value="drinnen">Drinnen (Halle)</option>
            </select>
          </Feld>
          <Feld label="Schwerpunkt">
            <select
              value={schwerpunkt}
              onChange={(e) => setSchwerpunkt(e.target.value as Disziplin | "")}
              className={eingabeKlasse}
            >
              <option value="">–</option>
              {DISZIPLINEN.map((d) => (
                <option key={d.wert} value={d.wert}>
                  {d.label}
                </option>
              ))}
            </select>
          </Feld>
        </div>
        <Feld label="Notizen zur Planung" className="mt-3">
          <textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            rows={2}
            placeholder="z. B. Elternabend danach, neues Kind dabei …"
            className={eingabeKlasse}
          />
        </Feld>
      </div>

      {/* Generator */}
      {!bearbeitenId && (
        <GeneratorPanel
          schwerpunkt={schwerpunkt}
          ort={ort}
          teilnehmer={teilnehmer}
          onVorschlag={(neu) => {
            setEintraege(neu);
            setAusMerkliste(false);
          }}
        />
      )}

      {/* Trainingsablauf */}
      <div className={`${karteKlasse} mt-4 p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Trainingsablauf</h2>
          <span className="tabular rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
            Gesamt: {gesamtdauer} Min.
          </span>
        </div>

        {eintraege.length === 0 ? (
          <div className="mt-3">
            <LeererHinweis
              titel="Noch keine Übungen im Training"
              text="Füge unten Übungen hinzu, nutze den Vorschlags-Generator oder merke dir Übungen in der Übungsdatenbank."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 rounded-md border border-slate-200">
            {eintraege.map((e, i) => {
              const u = daten.uebungen.find((x) => x.id === e.uebungId);
              return (
                <li
                  key={e.uebungId + i}
                  className="flex flex-wrap items-center gap-2 bg-white px-3 py-2 first:rounded-t-md last:rounded-b-md"
                >
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => verschieben(i, -1)}
                      disabled={i === 0}
                      className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                      title="Nach oben"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => verschieben(i, 1)}
                      disabled={i === eintraege.length - 1}
                      className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                      title="Nach unten"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  {u ? (
                    <>
                      <AbschnittBadge abschnitt={u.abschnitt} />
                      <span className="min-w-32 flex-1 text-sm font-medium text-slate-800">
                        {u.titel}
                      </span>
                    </>
                  ) : (
                    <span className="min-w-32 flex-1 text-sm italic text-slate-400">
                      (gelöschte Übung)
                    </span>
                  )}
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    <input
                      type="number"
                      min={1}
                      value={e.dauer}
                      onChange={(ev) =>
                        aktualisieren(i, { dauer: parseInt(ev.target.value, 10) || 0 })
                      }
                      className={`${eingabeKlasse} w-16 py-1 text-center`}
                    />
                    Min.
                  </label>
                  <input
                    value={e.notiz ?? ""}
                    onChange={(ev) => aktualisieren(i, { notiz: ev.target.value })}
                    placeholder="Notiz (z. B. 2 Teams, 20m-Bahn) …"
                    className={`${eingabeKlasse} w-full py-1 sm:w-52`}
                  />
                  <button
                    type="button"
                    onClick={() => setEintraege(eintraege.filter((_, j) => j !== i))}
                    className="rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Entfernen"
                  >
                    <X size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {material.length > 0 && (
          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Materialliste (automatisch)
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {material.map((m) => (
                <Badge key={m} className="border-slate-200 bg-white text-slate-700">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Übung hinzufügen
          </p>
          <UebungPicker
            gewaehlt={eintraege.map((e) => e.uebungId)}
            onHinzufuegen={hinzufuegen}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={speichern}
          disabled={eintraege.length === 0}
          className={primaerKnopf}
        >
          <Check size={15} />
          {bearbeitenId ? "Änderungen speichern" : "Training speichern"}
        </button>
        <button type="button" onClick={() => router.back()} className={sekundaerKnopf}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

// ===== Vorschlags-Generator =====

function GeneratorPanel({
  schwerpunkt,
  ort,
  teilnehmer,
  onVorschlag,
}: {
  schwerpunkt: Disziplin | "";
  ort: Ort | "";
  teilnehmer: string;
  onVorschlag: (eintraege: TrainingsEintrag[]) => void;
}) {
  const { daten } = useDaten();
  const [offen, setOffen] = useState(false);
  const [dauer, setDauer] = useState("60");
  const [alter, setAlter] = useState("");
  const [anlagenFehlen, setAnlagenFehlen] = useState<Anlage[]>([]);
  const [mitKennenlernen, setMitKennenlernen] = useState(false);

  function generieren() {
    const vorhanden = Object.fromEntries(
      ANLAGEN.map((a) => [a.wert, !anlagenFehlen.includes(a.wert)])
    ) as Record<Anlage, boolean>;
    const eintraege = trainingGenerieren(daten.uebungen, daten.trainings, {
      dauer: parseInt(dauer, 10) || 60,
      schwerpunkt,
      ort: ort === "beides" ? "" : ort,
      anlagenVorhanden: vorhanden,
      alter: alter ? parseInt(alter, 10) : null,
      gruppe: teilnehmer ? parseInt(teilnehmer, 10) : null,
      mitKennenlernspiel: mitKennenlernen,
    });
    onVorschlag(eintraege);
  }

  return (
    <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50/60">
      <button
        type="button"
        onClick={() => setOffen(!offen)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-sky-900"
      >
        <Wand2 size={16} className="text-sky-700" />
        Vorschlag generieren lassen
        <span className="ml-auto text-sky-600">
          {offen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {offen && (
        <div className="border-t border-sky-200 px-4 py-3">
          <p className="text-xs text-slate-600">
            Baut aus der Übungsdatenbank ein komplettes Training (Aufwärmen → Hauptteil →
            Staffel → Abschluss). Schwerpunkt, Ort und Gruppengröße kommen aus den Eckdaten
            oben; Favoriten und gut bewertete Übungen werden bevorzugt.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <Feld label="Zieldauer (Min.)">
              <input
                type="number"
                min={20}
                max={180}
                value={dauer}
                onChange={(e) => setDauer(e.target.value)}
                className={`${eingabeKlasse} w-24`}
              />
            </Feld>
            <Feld label="Alter (Jahre)">
              <input
                type="number"
                min={4}
                max={17}
                value={alter}
                onChange={(e) => setAlter(e.target.value)}
                placeholder="egal"
                className={`${eingabeKlasse} w-24`}
              />
            </Feld>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Fehlende Anlagen</span>
              <div className="flex flex-wrap gap-3 pb-1">
                {ANLAGEN.map((a) => (
                  <label
                    key={a.wert}
                    className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={anlagenFehlen.includes(a.wert)}
                      onChange={() =>
                        setAnlagenFehlen((alt) =>
                          alt.includes(a.wert)
                            ? alt.filter((x) => x !== a.wert)
                            : [...alt, a.wert]
                        )
                      }
                      className="h-3.5 w-3.5 accent-sky-700"
                    />
                    ohne {a.label}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 pb-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={mitKennenlernen}
                onChange={(e) => setMitKennenlernen(e.target.checked)}
                className="h-3.5 w-3.5 accent-sky-700"
              />
              Mit Kennenlernspiel
            </label>
            <button type="button" onClick={generieren} className={primaerKnopf}>
              <Wand2 size={15} />
              Vorschlag erstellen
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Ersetzt die aktuelle Übungsliste. Nochmal klicken = neuer Vorschlag.
          </p>
        </div>
      )}
    </div>
  );
}
