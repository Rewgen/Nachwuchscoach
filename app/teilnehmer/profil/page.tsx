"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Cake, Medal, Pencil, Plus, Trash2 } from "lucide-react";
import type { Leistung, Teilnehmer } from "@/lib/types";
import {
  LEISTUNGS_DISZIPLINEN,
  alterHeute,
  datumFormat,
  datumKurz,
  heuteISO,
  leistungFormat,
  tageBisGeburtstag,
} from "@/lib/labels";
import { neueId, useDaten } from "@/lib/store";
import {
  altersband,
  dsaAlter,
  gesamtwertung,
} from "@/lib/sportabzeichen";
import LeistungsChart from "@/components/LeistungsChart";
import TeilnehmerFormular from "@/components/TeilnehmerFormular";
import {
  Badge,
  Feld,
  LeererHinweis,
  SeitenKopf,
  eingabeKlasse,
  karteKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

export default function ProfilSeite() {
  return (
    <Suspense fallback={null}>
      <Profil />
    </Suspense>
  );
}

function Profil() {
  const params = useSearchParams();
  const id = params.get("id");
  const { daten, bereit, leistungLoeschen } = useDaten();
  const [bearbeiten, setBearbeiten] = useState(false);
  const [erfassen, setErfassen] = useState(false);

  const teilnehmer = daten.teilnehmer.find((t) => t.id === id);

  const leistungen = useMemo(
    () =>
      daten.leistungen
        .filter((l) => l.teilnehmerId === id)
        .sort((a, b) => b.datum.localeCompare(a.datum)),
    [daten.leistungen, id]
  );

  const nachDisziplin = useMemo(() => {
    const gruppen = new Map<string, Leistung[]>();
    for (const l of leistungen) {
      const liste = gruppen.get(l.disziplin) ?? [];
      liste.push(l);
      gruppen.set(l.disziplin, liste);
    }
    return [...gruppen.entries()].sort((a, b) => a[0].localeCompare(b[0], "de"));
  }, [leistungen]);

  const abzeichen = useMemo(
    () =>
      daten.sportabzeichen
        .filter((e) => e.teilnehmerId === id)
        .sort((a, b) => b.jahr - a.jahr),
    [daten.sportabzeichen, id]
  );

  if (!bereit) return null;
  if (!teilnehmer) {
    return (
      <LeererHinweis titel="Teilnehmer nicht gefunden" text="Vielleicht wurde er gelöscht.">
        <Link href="/teilnehmer" className={primaerKnopf}>
          Zur Teilnehmerliste
        </Link>
      </LeererHinweis>
    );
  }

  const alter = alterHeute(teilnehmer.geburtsdatum);
  const geburtstagIn = tageBisGeburtstag(teilnehmer.geburtsdatum);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/teilnehmer"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} />
        Teilnehmer
      </Link>

      <SeitenKopf
        titel={teilnehmer.name}
        beschreibung={[
          teilnehmer.geschlecht === "m"
            ? "Junge"
            : teilnehmer.geschlecht === "w"
              ? "Mädchen"
              : null,
          alter !== null ? `${alter} Jahre` : null,
          teilnehmer.geburtsdatum ? `geb. ${datumKurz(teilnehmer.geburtsdatum)}` : null,
          teilnehmer.gruppe,
        ]
          .filter(Boolean)
          .join(" · ")}
        aktionen={
          <>
            <button type="button" onClick={() => setErfassen(true)} className={primaerKnopf}>
              <Plus size={15} />
              Leistung erfassen
            </button>
            <button
              type="button"
              onClick={() => setBearbeiten(true)}
              className={sekundaerKnopf}
            >
              <Pencil size={14} />
              Bearbeiten
            </button>
          </>
        }
      />

      {geburtstagIn !== null && geburtstagIn <= 14 && (
        <p className="mb-4 flex items-center gap-2 rounded-md border border-pink-200 bg-pink-50 px-3 py-2 text-sm text-pink-900">
          <Cake size={15} />
          {geburtstagIn === 0
            ? `${teilnehmer.name} hat heute Geburtstag!`
            : `Geburtstag in ${geburtstagIn} Tagen (${datumKurz(teilnehmer.geburtsdatum!)})`}
        </p>
      )}

      {teilnehmer.notizen && (
        <p className="mb-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          {teilnehmer.notizen}
        </p>
      )}

      {/* Sportabzeichen-Historie */}
      {abzeichen.length > 0 && (
        <div className={`${karteKlasse} mb-4 p-4`}>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Medal size={15} className="text-amber-500" />
            Sportabzeichen
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {abzeichen.map((e) => {
              const dsaA = dsaAlter(teilnehmer, e.jahr);
              const wertung =
                teilnehmer.geschlecht && dsaA !== null
                  ? gesamtwertung(teilnehmer.geschlecht, altersband(dsaA), e)
                  : null;
              return (
                <Link
                  key={e.jahr}
                  href={`/sportabzeichen?jahr=${e.jahr}`}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm hover:border-slate-300"
                >
                  <span className="font-medium text-slate-800">{e.jahr}:</span>{" "}
                  {wertung?.fertig ? (
                    <span
                      className={
                        wertung.abzeichen === "gold"
                          ? "font-semibold text-amber-600"
                          : wertung.abzeichen === "silber"
                            ? "font-semibold text-slate-500"
                            : "font-semibold text-orange-700"
                      }
                    >
                      {wertung.abzeichen === "gold"
                        ? "Gold"
                        : wertung.abzeichen === "silber"
                          ? "Silber"
                          : "Bronze"}{" "}
                      ({wertung.punkte} Pkt.)
                    </span>
                  ) : (
                    <span className="text-slate-500">in Arbeit ({wertung?.punkte ?? 0} Pkt.)</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Leistungsentwicklung */}
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Leistungsentwicklung
      </h2>
      {nachDisziplin.length === 0 ? (
        <LeererHinweis
          titel="Noch keine Leistungen erfasst"
          text="Zeiten, Weiten und Punkte landen hier – aus der Stoppuhr, dem Sportabzeichen oder von Hand."
        >
          <button type="button" onClick={() => setErfassen(true)} className={primaerKnopf}>
            <Plus size={15} />
            Erste Leistung erfassen
          </button>
        </LeererHinweis>
      ) : (
        <div className="space-y-4">
          {nachDisziplin.map(([disziplin, liste]) => (
            <div key={disziplin} className={`${karteKlasse} p-4`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{disziplin}</h3>
                <span className="text-xs text-slate-400">{liste.length} Einträge</span>
              </div>
              {liste.length >= 2 && (
                <div className="mt-2">
                  <LeistungsChart
                    punkte={liste.map((l) => ({ datum: l.datum, wert: l.wert }))}
                    einheit={liste[0].einheit}
                  />
                </div>
              )}
              <ul className="mt-2 divide-y divide-slate-100">
                {liste.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-1.5 text-sm">
                    <span className="tabular w-24 shrink-0 text-slate-500">
                      {datumKurz(l.datum)}
                    </span>
                    <span className="tabular font-medium text-slate-800">
                      {leistungFormat(l.wert, l.einheit)}
                    </span>
                    {l.quelle !== "manuell" && (
                      <Badge>
                        {l.quelle === "stoppuhr" ? "Stoppuhr" : "Sportabzeichen"}
                      </Badge>
                    )}
                    {l.bemerkung && (
                      <span className="truncate text-slate-500">{l.bemerkung}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => leistungLoeschen(l.id)}
                      className="ml-auto rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600"
                      title="Eintrag löschen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {bearbeiten && (
        <TeilnehmerFormular teilnehmer={teilnehmer} onSchliessen={() => setBearbeiten(false)} />
      )}
      {erfassen && (
        <LeistungErfassen teilnehmer={teilnehmer} onSchliessen={() => setErfassen(false)} />
      )}
    </div>
  );
}

function LeistungErfassen({
  teilnehmer,
  onSchliessen,
}: {
  teilnehmer: Teilnehmer;
  onSchliessen: () => void;
}) {
  const { leistungSpeichern } = useDaten();
  const [disziplin, setDisziplin] = useState(LEISTUNGS_DISZIPLINEN[0].name);
  const [eigeneDisziplin, setEigeneDisziplin] = useState("");
  const [wertText, setWertText] = useState("");
  const [datum, setDatum] = useState(heuteISO());
  const [bemerkung, setBemerkung] = useState("");

  const vorschlag = LEISTUNGS_DISZIPLINEN.find((d) => d.name === disziplin);
  const einheit = vorschlag?.einheit ?? "s";
  const istEigene = disziplin === "__eigene__";

  function wertParsen(text: string): number | null {
    const sauber = text.trim().replace(",", ".");
    if (!sauber) return null;
    if (einheit === "min" && sauber.includes(":")) {
      const [m, s] = sauber.split(":");
      return (parseFloat(m) || 0) * 60 + (parseFloat(s) || 0);
    }
    const zahl = parseFloat(sauber);
    return isNaN(zahl) ? null : zahl;
  }

  function speichern() {
    const wert = wertParsen(wertText);
    const name = istEigene ? eigeneDisziplin.trim() : disziplin;
    if (wert === null || !name) return;
    leistungSpeichern({
      id: neueId(),
      teilnehmerId: teilnehmer.id,
      disziplin: name,
      wert,
      einheit: istEigene ? "s" : einheit,
      datum,
      bemerkung: bemerkung.trim() || undefined,
      quelle: "manuell",
    });
    onSchliessen();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:py-10">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="font-semibold text-slate-900">
          Leistung erfassen – {teilnehmer.name}
        </h2>
        <div className="mt-3 space-y-3">
          <Feld label="Disziplin">
            <select
              value={disziplin}
              onChange={(e) => setDisziplin(e.target.value)}
              className={eingabeKlasse}
            >
              {LEISTUNGS_DISZIPLINEN.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.einheit})
                </option>
              ))}
              <option value="__eigene__">Eigene Disziplin …</option>
            </select>
          </Feld>
          {istEigene && (
            <Feld label="Name der Disziplin">
              <input
                value={eigeneDisziplin}
                onChange={(e) => setEigeneDisziplin(e.target.value)}
                placeholder="z. B. 60m Hürden"
                className={eingabeKlasse}
              />
            </Feld>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Feld
              label={`Wert${
                istEigene ? "" : einheit === "min" ? " (m:ss)" : ` (${einheit})`
              }`}
            >
              <input
                value={wertText}
                onChange={(e) => setWertText(e.target.value)}
                placeholder={einheit === "min" ? "z. B. 4:50" : "z. B. 7,4"}
                inputMode="decimal"
                className={eingabeKlasse}
                autoFocus
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
          </div>
          <Feld label="Bemerkung (optional)">
            <input
              value={bemerkung}
              onChange={(e) => setBemerkung(e.target.value)}
              placeholder="z. B. Rückenwind, neuer Anlauf …"
              className={eingabeKlasse}
            />
          </Feld>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={speichern}
              disabled={wertParsen(wertText) === null || (istEigene && !eigeneDisziplin.trim())}
              className={primaerKnopf}
            >
              Speichern
            </button>
            <button type="button" onClick={onSchliessen} className={sekundaerKnopf}>
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
