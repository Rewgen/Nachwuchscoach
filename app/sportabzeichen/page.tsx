"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ClipboardList,
  Download,
  Hash,
  Printer,
  Settings2,
  UserPlus,
  Waves,
} from "lucide-react";
import type {
  SportabzeichenEintrag,
  Teilnehmer,
} from "@/lib/types";
import { useDaten, neueId } from "@/lib/store";
import {
  DSA_GRUPPEN,
  DSA_GRUPPEN_NAMEN,
  DSA_KATALOG,
  altersband,
  bestwert,
  bestwertFormat,
  dsaAlter,
  gesamtwertung,
  leereVersuche,
  medailleFuerWert,
  sportabzeichenSettings,
  versucheAnzahl,
  type SportabzeichenSettings,
} from "@/lib/sportabzeichen";
import MedaillenPille from "@/components/MedaillenPille";
import {
  Dialog,
  Feld,
  LeererHinweis,
  SeitenKopf,
  eingabeKlasse,
  karteKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

export default function SportabzeichenSeite() {
  return (
    <Suspense fallback={null}>
      <Sportabzeichen />
    </Suspense>
  );
}

function Sportabzeichen() {
  const params = useSearchParams();
  const { daten, bereit, sportabzeichenSpeichern, sportabzeichenLoeschen, einstellungSetzen } =
    useDaten();
  const aktuellesJahr = new Date().getFullYear();
  const [jahr, setJahr] = useState(() => {
    const p = parseInt(params.get("jahr") ?? "", 10);
    return p || aktuellesJahr;
  });
  const [teilnahmeOffen, setTeilnahmeOffen] = useState(false);
  const [settingsOffen, setSettingsOffen] = useState(false);

  const settings: SportabzeichenSettings = sportabzeichenSettings(daten.einstellungen);

  const eintraege = useMemo(
    () => daten.sportabzeichen.filter((e) => e.jahr === jahr),
    [daten.sportabzeichen, jahr]
  );

  // Teilnehmende Kinder in Startnummern-Reihenfolge.
  const teilnehmende = useMemo(() => {
    return eintraege
      .map((e) => ({
        eintrag: e,
        teilnehmer: daten.teilnehmer.find((t) => t.id === e.teilnehmerId),
      }))
      .filter(
        (x): x is { eintrag: SportabzeichenEintrag; teilnehmer: Teilnehmer } =>
          x.teilnehmer !== undefined
      )
      .sort(
        (a, b) =>
          (a.eintrag.startNr ?? 999) - (b.eintrag.startNr ?? 999) ||
          a.teilnehmer.name.localeCompare(b.teilnehmer.name, "de")
      );
  }, [eintraege, daten.teilnehmer]);

  const geeignete = useMemo(
    () =>
      daten.teilnehmer
        .filter((t) => t.geburtsdatum && t.geschlecht)
        .sort((a, b) => a.name.localeCompare(b.name, "de")),
    [daten.teilnehmer]
  );

  if (!bereit) return null;

  function startnummernVergeben() {
    teilnehmende.forEach(({ eintrag }, i) => {
      sportabzeichenSpeichern({ ...eintrag, startNr: i + 1 });
    });
  }

  function csvExport() {
    const kopf = ["Nr", "Name", "m/w", "AK"];
    for (const g of DSA_GRUPPEN) kopf.push(`${DSA_GRUPPEN_NAMEN[g]} Bestwert`, "Medaille");
    kopf.push("Schwimmen", "Punkte", "Gesamt");
    const zeilen = [kopf];
    for (const { eintrag, teilnehmer } of teilnehmende) {
      const alter = dsaAlter(teilnehmer, jahr);
      if (alter === null || !teilnehmer.geschlecht) continue;
      const band = altersband(alter);
      const zeile: string[] = [
        String(eintrag.startNr ?? ""),
        teilnehmer.name,
        teilnehmer.geschlecht,
        band,
      ];
      for (const g of DSA_GRUPPEN) {
        const disziplin = DSA_KATALOG[teilnehmer.geschlecht][band][g];
        const best = bestwert(disziplin, eintrag.versuche[g]);
        zeile.push(
          best === null ? "" : bestwertFormat(disziplin, best),
          medailleFuerWert(disziplin, best) ?? ""
        );
      }
      const wertung = gesamtwertung(teilnehmer.geschlecht, band, eintrag);
      zeile.push(
        eintrag.schwimmnachweis ? "ja" : "nein",
        wertung.fertig ? String(wertung.punkte) : "",
        wertung.fertig ? wertung.abzeichen : ""
      );
      zeilen.push(zeile);
    }
    const csv = zeilen
      .map((z) =>
        z.map((c) => (/[";\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(";")
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Sportabzeichen_${jahr}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <SeitenKopf
        titel="Deutsches Sportabzeichen"
        beschreibung="Ergebnisse erfassen, Medaillen automatisch berechnen, Laufzettel und Abnahmelisten drucken."
        aktionen={
          <>
            <select
              value={jahr}
              onChange={(e) => setJahr(parseInt(e.target.value, 10))}
              className={eingabeKlasse}
              title="Wettkampfjahr"
            >
              {[aktuellesJahr + 1, aktuellesJahr, aktuellesJahr - 1, aktuellesJahr - 2].map(
                (j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                )
              )}
            </select>
            <button
              type="button"
              onClick={() => setSettingsOffen(true)}
              className={sekundaerKnopf}
              title="Verein, Veranstaltung, Druckfarbe"
            >
              <Settings2 size={15} />
            </button>
          </>
        }
      />

      {/* Werkzeugleiste */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setTeilnahmeOffen(true)} className={primaerKnopf}>
          <UserPlus size={15} />
          Teilnahme verwalten
        </button>
        <button
          type="button"
          onClick={startnummernVergeben}
          disabled={teilnehmende.length === 0}
          className={sekundaerKnopf}
        >
          <Hash size={15} />
          Startnummern vergeben
        </button>
        <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
        <Link
          href={`/sportabzeichen/laufzettel?jahr=${jahr}`}
          className={teilnehmende.length === 0 ? `${sekundaerKnopf} pointer-events-none opacity-40` : sekundaerKnopf}
        >
          <Printer size={15} />
          Laufzettel
        </Link>
        <Link
          href={`/sportabzeichen/liste?jahr=${jahr}&modus=leer`}
          className={teilnehmende.length === 0 ? `${sekundaerKnopf} pointer-events-none opacity-40` : sekundaerKnopf}
        >
          <ClipboardList size={15} />
          Prüfer-Notizzettel
        </Link>
        <Link
          href={`/sportabzeichen/liste?jahr=${jahr}&modus=live`}
          className={teilnehmende.length === 0 ? `${sekundaerKnopf} pointer-events-none opacity-40` : sekundaerKnopf}
        >
          <Printer size={15} />
          Ergebnisliste
        </Link>
        <button
          type="button"
          onClick={csvExport}
          disabled={teilnehmende.length === 0}
          className={sekundaerKnopf}
        >
          <Download size={15} />
          CSV
        </button>
      </div>

      {/* Legende */}
      <p className="mt-3 text-xs text-slate-500">
        Punktesystem: Bronze 1 · Silber 2 · Gold 3 je Disziplin — Gesamt: 4–7 Bronze, 8–10
        Silber, 11–12 Gold. In jeder der vier Gruppen ist mindestens Bronze nötig. Mehrere
        Versuche je Feld, der beste zählt (Zonenweitsprung: Summe der besten 3 von 4).
      </p>

      {teilnehmende.length === 0 ? (
        <div className="mt-4">
          <LeererHinweis
            titel={`Noch keine Kinder für ${jahr} gemeldet`}
            text={
              geeignete.length === 0
                ? "Lege zuerst Teilnehmer mit Geburtsdatum und Geschlecht an – dann kannst du sie hier fürs Sportabzeichen melden."
                : "Wähle über „Teilnahme verwalten“, welche Kinder dieses Jahr das Sportabzeichen machen."
            }
          >
            {geeignete.length === 0 ? (
              <Link href="/teilnehmer" className={primaerKnopf}>
                Zu den Teilnehmern
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setTeilnahmeOffen(true)}
                className={primaerKnopf}
              >
                <UserPlus size={15} />
                Teilnahme verwalten
              </button>
            )}
          </LeererHinweis>
        </div>
      ) : (
        <div className={`${karteKlasse} mt-4 overflow-x-auto`}>
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2.5 font-medium">Nr</th>
                <th className="px-3 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">AK</th>
                {DSA_GRUPPEN.map((g) => (
                  <th key={g} className="px-3 py-2.5 font-medium">
                    {DSA_GRUPPEN_NAMEN[g]}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-medium" title="Schwimmnachweis (Info)">
                  <Waves size={14} />
                </th>
                <th className="px-3 py-2.5 font-medium">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {teilnehmende.map(({ eintrag, teilnehmer }) => (
                <ErfassungsZeile
                  key={teilnehmer.id}
                  eintrag={eintrag}
                  teilnehmer={teilnehmer}
                  jahr={jahr}
                  onSpeichern={sportabzeichenSpeichern}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Teilnahme-Dialog */}
      {teilnahmeOffen && (
        <Dialog
          offen
          onSchliessen={() => setTeilnahmeOffen(false)}
          titel={`Teilnahme ${jahr}`}
          breite="max-w-lg"
        >
          {geeignete.length === 0 ? (
            <p className="text-sm text-slate-500">
              Keine Teilnehmer mit Geburtsdatum und Geschlecht vorhanden.
            </p>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto">
              {geeignete.map((t) => {
                const eintrag = eintraege.find((e) => e.teilnehmerId === t.id);
                const alter = dsaAlter(t, jahr);
                return (
                  <li key={t.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={!!eintrag}
                        onChange={(e) => {
                          if (e.target.checked) {
                            sportabzeichenSpeichern({
                              jahr,
                              teilnehmerId: t.id,
                              versuche: leereVersuche(),
                              schwimmnachweis: false,
                            });
                          } else {
                            const hatDaten =
                              eintrag &&
                              DSA_GRUPPEN.some((g) =>
                                eintrag.versuche[g].some((v) => v?.trim())
                              );
                            if (
                              !hatDaten ||
                              window.confirm(
                                `Für ${t.name} sind schon Ergebnisse eingetragen – wirklich abmelden und Ergebnisse löschen?`
                              )
                            ) {
                              sportabzeichenLoeschen(jahr, t.id);
                            }
                          }
                        }}
                        className="h-4 w-4 accent-sky-700"
                      />
                      <span className="flex-1 font-medium text-slate-800">{t.name}</span>
                      <span className="text-xs text-slate-400">
                        {t.geschlecht === "m" ? "Junge" : "Mädchen"} · AK{" "}
                        {alter !== null ? altersband(alter) : "?"}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-400">
            Altersklasse = Wettkampfjahr − Geburtsjahr (DSA-Stichtag Jahresende).
          </p>
        </Dialog>
      )}

      {/* Einstellungen-Dialog */}
      {settingsOffen && (
        <Dialog
          offen
          onSchliessen={() => setSettingsOffen(false)}
          titel="Druck-Einstellungen"
          breite="max-w-md"
        >
          <SettingsFormular
            settings={settings}
            onSpeichern={(s) => {
              einstellungSetzen("sportabzeichen", s);
              setSettingsOffen(false);
            }}
          />
        </Dialog>
      )}
    </div>
  );
}

// ===== Erfassungszeile =====

function ErfassungsZeile({
  eintrag,
  teilnehmer,
  jahr,
  onSpeichern,
}: {
  eintrag: SportabzeichenEintrag;
  teilnehmer: Teilnehmer;
  jahr: number;
  onSpeichern: (e: SportabzeichenEintrag) => void;
}) {
  const alter = dsaAlter(teilnehmer, jahr);
  if (alter === null || !teilnehmer.geschlecht) return null;
  const band = altersband(alter);
  const geschlecht = teilnehmer.geschlecht;
  const wertung = gesamtwertung(geschlecht, band, eintrag);

  return (
    <tr className="border-b border-slate-100 align-top last:border-0">
      <td className="tabular px-3 py-2.5 font-medium text-slate-500">
        {eintrag.startNr ?? "–"}
      </td>
      <td className="px-3 py-2.5">
        <Link
          href={`/teilnehmer/profil?id=${teilnehmer.id}`}
          className="whitespace-nowrap font-medium text-slate-900 hover:text-sky-800"
        >
          {teilnehmer.name}
        </Link>
        <p className="text-xs text-slate-400">
          {geschlecht === "m" ? "Junge" : "Mädchen"} · {alter} J.
        </p>
      </td>
      <td className="tabular px-3 py-2.5 font-semibold text-slate-700">{band}</td>
      {DSA_GRUPPEN.map((g) => {
        const disziplin = DSA_KATALOG[geschlecht][band][g];
        const anzahl = versucheAnzahl(disziplin);
        const best = bestwert(disziplin, eintrag.versuche[g]);
        const medaille = medailleFuerWert(disziplin, best);
        return (
          <td key={g} className="px-3 py-2.5">
            <p className="whitespace-nowrap text-[10px] text-slate-400">
              {disziplin.label.replace(/^\w+ /, "")} · B {disziplin.werte[0]} · S{" "}
              {disziplin.werte[1]} · G {disziplin.werte[2]}
            </p>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: anzahl }).map((_, i) => (
                <input
                  key={i}
                  value={eintrag.versuche[g][i] ?? ""}
                  onChange={(e) => {
                    const versuche = { ...eintrag.versuche, [g]: [...eintrag.versuche[g]] };
                    versuche[g][i] = e.target.value;
                    onSpeichern({ ...eintrag, versuche });
                  }}
                  placeholder={disziplin.einheit === "min" ? "m:ss" : disziplin.einheit}
                  inputMode="decimal"
                  className="tabular w-12 rounded border border-slate-300 px-1 py-1 text-center text-xs outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-100"
                />
              ))}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">
                Best: <b className="tabular">{bestwertFormat(disziplin, best)}</b>
              </span>
              <MedaillenPille medaille={medaille} />
            </p>
          </td>
        );
      })}
      <td className="px-3 py-2.5">
        <input
          type="checkbox"
          checked={eintrag.schwimmnachweis}
          onChange={(e) => onSpeichern({ ...eintrag, schwimmnachweis: e.target.checked })}
          className="h-4 w-4 accent-sky-700"
          title="Schwimmnachweis liegt vor"
        />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        {wertung.fertig ? (
          <span className="flex items-center gap-1.5">
            <MedaillenPille medaille={wertung.abzeichen} gross />
            <span className="tabular text-xs text-slate-500">{wertung.punkte} Pkt.</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">offen ({wertung.punkte} Pkt.)</span>
        )}
      </td>
    </tr>
  );
}

function SettingsFormular({
  settings,
  onSpeichern,
}: {
  settings: SportabzeichenSettings;
  onSpeichern: (s: SportabzeichenSettings) => void;
}) {
  const [verein, setVerein] = useState(settings.verein);
  const [veranstaltung, setVeranstaltung] = useState(settings.veranstaltung);
  const [datum, setDatum] = useState(settings.datum);
  const [farbe, setFarbe] = useState(settings.farbe);

  const VARIANTEN = [
    { name: "Eisblau", wert: "#0369a1" },
    { name: "Klassisch Blau", wert: "#1f6feb" },
    { name: "Vereinsgrün", wert: "#047857" },
    { name: "Bordeaux", wert: "#9f1239" },
  ];

  return (
    <div className="space-y-3">
      <Feld label="Verein">
        <input value={verein} onChange={(e) => setVerein(e.target.value)} className={eingabeKlasse} />
      </Feld>
      <Feld label="Veranstaltung">
        <input
          value={veranstaltung}
          onChange={(e) => setVeranstaltung(e.target.value)}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Datum (Anzeige auf dem Laufzettel)">
        <input
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
          placeholder="z. B. 12.07.2026"
          className={eingabeKlasse}
        />
      </Feld>
      <div>
        <p className="text-xs font-medium text-slate-600">Designvariante (Druckfarbe)</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {VARIANTEN.map((v) => (
            <button
              key={v.wert}
              type="button"
              onClick={() => setFarbe(v.wert)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                farbe === v.wert
                  ? "border-slate-800 text-slate-900"
                  : "border-slate-200 text-slate-500 hover:border-slate-400"
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: v.wert }} />
              {v.name}
            </button>
          ))}
          <input
            type="color"
            value={farbe}
            onChange={(e) => setFarbe(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-slate-200"
            title="Eigene Farbe"
          />
        </div>
      </div>
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onSpeichern({ verein, veranstaltung, datum, farbe })}
          className={primaerKnopf}
        >
          Speichern
        </button>
      </div>
    </div>
  );
}
