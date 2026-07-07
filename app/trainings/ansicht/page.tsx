"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Lightbulb,
  Pencil,
  Printer,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import type { Training, UebungsBewertung } from "@/lib/types";
import { BEWERTUNGEN, datumFormat, disziplinLabel, ortLabel } from "@/lib/labels";
import { materialFuerTraining, useDaten } from "@/lib/store";
import WetterKarte from "@/components/WetterKarte";
import {
  AbschnittBadge,
  BewertungsSymbol,
  Feld,
  LeererHinweis,
  SeitenKopf,
  eingabeKlasse,
  gefahrKnopf,
  karteKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

export default function TrainingAnsichtSeite() {
  return (
    <Suspense fallback={null}>
      <TrainingAnsicht />
    </Suspense>
  );
}

function TrainingAnsicht() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const { daten, bereit, trainingSpeichern, trainingLoeschen } = useDaten();
  const [abschlussModus, setAbschlussModus] = useState(false);

  if (!bereit) return null;
  const training = daten.trainings.find((t) => t.id === id);
  if (!training) {
    return (
      <LeererHinweis titel="Training nicht gefunden" text="Vielleicht wurde es gelöscht.">
        <Link href="/trainings" className={primaerKnopf}>
          Zu meinen Trainings
        </Link>
      </LeererHinweis>
    );
  }

  const material = materialFuerTraining(training, daten.uebungen);
  const gesamtdauer = training.eintraege.reduce((s, e) => s + (e.dauer || 0), 0);

  function loeschen() {
    if (!training) return;
    if (window.confirm(`„${training.titel}" wirklich löschen?`)) {
      trainingLoeschen(training.id);
      router.push("/trainings");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="print-verbergen">
        <Link
          href="/trainings"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          Meine Trainings
        </Link>
        <SeitenKopf
          titel={training.titel}
          beschreibung={`${datumFormat(training.datum)}${
            training.status === "abgeschlossen" ? " · abgeschlossen" : " · geplant"
          }`}
          aktionen={
            <>
              {training.status === "geplant" && !abschlussModus && (
                <button
                  type="button"
                  onClick={() => setAbschlussModus(true)}
                  className={primaerKnopf}
                >
                  <CheckCircle2 size={15} />
                  Training abschließen
                </button>
              )}
              <button type="button" onClick={() => window.print()} className={sekundaerKnopf}>
                <Printer size={15} />
                Drucken
              </button>
              <Link href={`/planen?id=${training.id}`} className={sekundaerKnopf}>
                <Pencil size={14} />
                Bearbeiten
              </Link>
              <Link href={`/planen?vorlage=${training.id}`} className={sekundaerKnopf}>
                <Copy size={14} />
                Als Vorlage
              </Link>
              <button type="button" onClick={loeschen} className={gefahrKnopf}>
                <Trash2 size={14} />
              </button>
            </>
          }
        />
        {training.status === "geplant" && (training.ort ?? "draussen") === "draussen" && (
          <div className="mb-4">
            <WetterKarte datum={training.datum} />
          </div>
        )}
      </div>

      {/* Druckbarer Trainingsplan */}
      <div className={`${karteKlasse} print-flaeche p-6`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-800">
              Trainingsplan
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {training.titel}
            </h1>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-medium">{datumFormat(training.datum)}</p>
            <p className="text-xs text-slate-400">
              {[
                training.gruppe,
                training.teilnehmerAnzahl ? `${training.teilnehmerAnzahl} Kinder` : null,
                training.ort ? ortLabel(training.ort) : null,
                training.schwerpunkt ? `Schwerpunkt ${disziplinLabel(training.schwerpunkt)}` : null,
                `${gesamtdauer} Min.`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        {training.notizen && (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {training.notizen}
          </p>
        )}

        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2 pr-2 font-medium">Abschnitt</th>
              <th className="pb-2 pr-2 font-medium">Übung</th>
              <th className="pb-2 pr-2 text-center font-medium">Dauer</th>
              <th className="pb-2 font-medium">Notiz</th>
            </tr>
          </thead>
          <tbody>
            {training.eintraege.map((e, i) => {
              const u = daten.uebungen.find((x) => x.id === e.uebungId);
              return (
                <tr key={e.uebungId + i} className="border-t border-slate-100 align-top">
                  <td className="py-2.5 pr-2">
                    {u && <AbschnittBadge abschnitt={u.abschnitt} />}
                  </td>
                  <td className="py-2.5 pr-2">
                    {u ? (
                      <>
                        <p className="font-medium text-slate-900">
                          {u.titel} <BewertungsSymbol bewertung={e.bewertung} />
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {u.beschreibung}
                        </p>
                        {u.material.length > 0 && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            Material: {u.material.join(", ")}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="italic text-slate-400">(gelöschte Übung)</span>
                    )}
                  </td>
                  <td className="tabular whitespace-nowrap py-2.5 pr-2 text-center text-slate-600">
                    {e.dauer} Min.
                  </td>
                  <td className="py-2.5 text-slate-600">{e.notiz}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {material.length > 0 && (
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Materialliste zum Abhaken
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1.5">
              {material.map((m) => (
                <label key={m} className="flex items-center gap-1.5 text-sm text-slate-700">
                  <input type="checkbox" className="h-4 w-4 accent-sky-700" />
                  {m}
                </label>
              ))}
            </div>
          </div>
        )}

        {training.status === "abgeschlossen" && training.reflexion && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ReflexionsBox
              icon={<ThumbsUp size={13} />}
              titel="Das lief gut"
              text={training.reflexion.gut}
              klasse="border-emerald-200 bg-emerald-50 text-emerald-900"
            />
            <ReflexionsBox
              icon={<ThumbsDown size={13} />}
              titel="Das lief nicht"
              text={training.reflexion.schlecht}
              klasse="border-red-200 bg-red-50 text-red-900"
            />
            <ReflexionsBox
              icon={<Lightbulb size={13} />}
              titel="Fürs nächste Mal"
              text={training.reflexion.naechstesMal}
              klasse="border-sky-200 bg-sky-50 text-sky-900"
            />
          </div>
        )}
      </div>

      {abschlussModus && (
        <AbschlussFormular
          training={training}
          onFertig={(t) => {
            trainingSpeichern(t);
            setAbschlussModus(false);
          }}
          onAbbrechen={() => setAbschlussModus(false)}
        />
      )}

      {training.status === "abgeschlossen" && !abschlussModus && (
        <div className="print-verbergen mt-4">
          <button
            type="button"
            onClick={() => setAbschlussModus(true)}
            className={sekundaerKnopf}
          >
            <Pencil size={14} />
            Reflexion bearbeiten
          </button>
        </div>
      )}
    </div>
  );
}

function ReflexionsBox({
  icon,
  titel,
  text,
  klasse,
}: {
  icon: React.ReactNode;
  titel: string;
  text: string;
  klasse: string;
}) {
  return (
    <div className={`rounded-md border p-3 ${klasse}`}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-75">
        {icon}
        {titel}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm">{text || "–"}</p>
    </div>
  );
}

function AbschlussFormular({
  training,
  onFertig,
  onAbbrechen,
}: {
  training: Training;
  onFertig: (t: Training) => void;
  onAbbrechen: () => void;
}) {
  const { daten } = useDaten();
  const [gut, setGut] = useState(training.reflexion?.gut ?? "");
  const [schlecht, setSchlecht] = useState(training.reflexion?.schlecht ?? "");
  const [naechstesMal, setNaechstesMal] = useState(training.reflexion?.naechstesMal ?? "");
  const [eintraege, setEintraege] = useState(training.eintraege);

  function bewerten(index: number, bewertung: UebungsBewertung) {
    setEintraege((alt) =>
      alt.map((e, i) =>
        i === index
          ? { ...e, bewertung: e.bewertung === bewertung ? undefined : bewertung }
          : e
      )
    );
  }

  return (
    <div className="print-verbergen mt-4 rounded-lg border-2 border-sky-300 bg-white p-5">
      <h2 className="font-semibold text-slate-900">Wie lief das Training?</h2>
      <p className="text-sm text-slate-500">
        Kurz festhalten – dein zukünftiges Ich sagt Danke, wenn es Ideen sucht.
      </p>

      <div className="mt-4 space-y-1.5">
        {eintraege.map((e, i) => {
          const u = daten.uebungen.find((x) => x.id === e.uebungId);
          return (
            <div
              key={e.uebungId + i}
              className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <span className="min-w-32 flex-1 text-sm font-medium text-slate-800">
                {u?.titel ?? "(gelöschte Übung)"}
              </span>
              <div className="flex gap-1">
                {BEWERTUNGEN.map((b) => (
                  <button
                    key={b.wert}
                    type="button"
                    title={b.label}
                    onClick={() => bewerten(i, b.wert)}
                    className={`rounded-md border px-2 py-1.5 transition-colors ${
                      e.bewertung === b.wert
                        ? "border-sky-700 bg-sky-700 text-white"
                        : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    {b.wert === "gut" && <ThumbsUp size={14} />}
                    {b.wert === "mittel" && <span className="block w-3.5 text-center leading-none">–</span>}
                    {b.wert === "schlecht" && <ThumbsDown size={14} />}
                  </button>
                ))}
              </div>
              <input
                value={e.notiz ?? ""}
                onChange={(ev) =>
                  setEintraege((alt) =>
                    alt.map((x, j) => (j === i ? { ...x, notiz: ev.target.value } : x))
                  )
                }
                placeholder="Notiz zur Übung …"
                className={`${eingabeKlasse} w-full py-1 sm:w-52`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Feld label="Das lief gut">
          <textarea
            value={gut}
            onChange={(e) => setGut(e.target.value)}
            rows={3}
            className={eingabeKlasse}
          />
        </Feld>
        <Feld label="Das lief nicht">
          <textarea
            value={schlecht}
            onChange={(e) => setSchlecht(e.target.value)}
            rows={3}
            className={eingabeKlasse}
          />
        </Feld>
        <Feld label="Fürs nächste Mal">
          <textarea
            value={naechstesMal}
            onChange={(e) => setNaechstesMal(e.target.value)}
            rows={3}
            className={eingabeKlasse}
          />
        </Feld>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() =>
            onFertig({
              ...training,
              status: "abgeschlossen",
              eintraege,
              reflexion: { gut, schlecht, naechstesMal },
            })
          }
          className={primaerKnopf}
        >
          Speichern
        </button>
        <button type="button" onClick={onAbbrechen} className={sekundaerKnopf}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}
