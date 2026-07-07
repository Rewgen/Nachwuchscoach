"use client";

import Link from "next/link";
import {
  ArrowRight,
  Cake,
  CalendarPlus,
  ClipboardList,
  Dumbbell,
  Lightbulb,
  Medal,
  PenLine,
  ThumbsUp,
  Timer,
} from "lucide-react";
import {
  datumFormat,
  datumKurz,
  disziplinLabel,
  heuteISO,
  ortLabel,
  tageBisGeburtstag,
} from "@/lib/labels";
import { materialFuerTraining, useDaten } from "@/lib/store";
import WetterKarte from "@/components/WetterKarte";
import { Badge, SeitenKopf, karteKlasse, primaerKnopf, sekundaerKnopf } from "@/components/ui";

export default function StartSeite() {
  const { daten, bereit } = useDaten();
  if (!bereit) return null;

  const heute = heuteISO();
  const naechstes = daten.trainings
    .filter((t) => t.status === "geplant" && t.datum >= heute)
    .sort((a, b) => a.datum.localeCompare(b.datum))[0];
  const offeneReflexionen = daten.trainings
    .filter((t) => t.status === "geplant" && t.datum < heute)
    .sort((a, b) => b.datum.localeCompare(a.datum));
  const letztes = daten.trainings
    .filter((t) => t.status === "abgeschlossen")
    .sort((a, b) => b.datum.localeCompare(a.datum))[0];

  const geburtstage = daten.teilnehmer
    .map((t) => ({ teilnehmer: t, inTagen: tageBisGeburtstag(t.geburtsdatum) }))
    .filter((x): x is { teilnehmer: (typeof daten.teilnehmer)[0]; inTagen: number } =>
      x.inTagen !== null && x.inTagen <= 30
    )
    .sort((a, b) => a.inTagen - b.inTagen)
    .slice(0, 6);

  return (
    <div>
      <SeitenKopf
        titel="Übersicht"
        beschreibung={new Date().toLocaleDateString("de-DE", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        aktionen={
          <>
            <Link href="/uebungen" className={sekundaerKnopf}>
              <Dumbbell size={15} />
              Übung finden
            </Link>
            <Link href="/planen" className={primaerKnopf}>
              <CalendarPlus size={15} />
              Training planen
            </Link>
          </>
        }
      />

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kennzahl zahl={daten.uebungen.length} label="Übungen" href="/uebungen" />
        <Kennzahl
          zahl={daten.uebungen.filter((u) => u.favorit).length}
          label="Favoriten"
          href="/uebungen"
        />
        <Kennzahl
          zahl={daten.trainings.filter((t) => t.status === "geplant").length}
          label="Geplant"
          href="/trainings"
        />
        <Kennzahl
          zahl={daten.trainings.filter((t) => t.status === "abgeschlossen").length}
          label="Im Log"
          href="/trainings"
        />
        <Kennzahl zahl={daten.teilnehmer.length} label="Teilnehmer" href="/teilnehmer" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Nächstes Training */}
        <div className={`${karteKlasse} p-5 lg:col-span-2`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Nächstes Training
          </p>
          {naechstes ? (
            <>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  {naechstes.titel}
                </h2>
                <span className="text-sm text-slate-500">
                  {datumFormat(naechstes.datum)}
                  {naechstes.gruppe ? ` · ${naechstes.gruppe}` : ""}
                  {naechstes.ort ? ` · ${ortLabel(naechstes.ort)}` : ""}
                  {naechstes.schwerpunkt
                    ? ` · ${disziplinLabel(naechstes.schwerpunkt)}`
                    : ""}
                </span>
              </div>
              {(naechstes.ort ?? "draussen") === "draussen" && (
                <div className="mt-3">
                  <WetterKarte datum={naechstes.datum} />
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-1">
                {materialFuerTraining(naechstes, daten.uebungen).map((m) => (
                  <Badge key={m}>{m}</Badge>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/trainings/ansicht?id=${naechstes.id}`} className={primaerKnopf}>
                  Ansehen & drucken
                </Link>
                <Link href={`/planen?id=${naechstes.id}`} className={sekundaerKnopf}>
                  Bearbeiten
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-slate-600">Kein Training geplant.</p>
              <p className="mt-0.5 text-sm text-slate-400">
                In fünf Minuten steht dein nächstes Training – Übungen merken oder den
                Generator nutzen.
              </p>
              <Link href="/planen" className={`${primaerKnopf} mt-3`}>
                <CalendarPlus size={15} />
                Jetzt planen
              </Link>
            </div>
          )}
        </div>

        {/* Geburtstage */}
        <div className={`${karteKlasse} p-5`}>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Cake size={13} className="text-pink-500" />
            Geburtstage (30 Tage)
          </p>
          {geburtstage.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">
              {daten.teilnehmer.length === 0
                ? "Lege Teilnehmer mit Geburtsdatum an, dann erinnert dich die App hier."
                : "Keine Geburtstage in den nächsten 30 Tagen."}
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {geburtstage.map(({ teilnehmer, inTagen }) => (
                <li key={teilnehmer.id} className="flex items-baseline gap-2 text-sm">
                  <Link
                    href={`/teilnehmer/profil?id=${teilnehmer.id}`}
                    className="font-medium text-slate-800 hover:text-sky-800"
                  >
                    {teilnehmer.name}
                  </Link>
                  <span
                    className={`ml-auto whitespace-nowrap text-xs ${
                      inTagen === 0 ? "font-semibold text-pink-600" : "text-slate-400"
                    }`}
                  >
                    {inTagen === 0
                      ? "heute!"
                      : inTagen === 1
                        ? "morgen"
                        : `in ${inTagen} Tagen`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Offene Reflexionen */}
      {offeneReflexionen.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-900">
            <PenLine size={15} />
            {offeneReflexionen.length === 1
              ? "Eine vergangene Einheit wartet auf deine Reflexion:"
              : `${offeneReflexionen.length} vergangene Einheiten warten auf deine Reflexion:`}
          </p>
          <ul className="mt-1.5 space-y-1">
            {offeneReflexionen.slice(0, 3).map((t) => (
              <li key={t.id}>
                <Link
                  href={`/trainings/ansicht?id=${t.id}`}
                  className="text-sm font-medium text-amber-950 underline-offset-2 hover:underline"
                >
                  {datumKurz(t.datum)} – {t.titel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Zuletzt im Log */}
      {letztes && (
        <div className={`${karteKlasse} mt-4 p-5`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Zuletzt im Log
          </p>
          <Link
            href={`/trainings/ansicht?id=${letztes.id}`}
            className="mt-1 inline-block font-semibold text-slate-900 hover:text-sky-800"
          >
            {letztes.titel}{" "}
            <span className="text-sm font-normal text-slate-400">
              · {datumFormat(letztes.datum)}
            </span>
          </Link>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {letztes.reflexion?.gut && (
              <p className="flex items-start gap-1.5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <ThumbsUp size={13} className="mt-0.5 shrink-0" />
                {letztes.reflexion.gut}
              </p>
            )}
            {letztes.reflexion?.naechstesMal && (
              <p className="flex items-start gap-1.5 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800">
                <Lightbulb size={13} className="mt-0.5 shrink-0" />
                {letztes.reflexion.naechstesMal}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Schnellzugriffe */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SchnellLink href="/sportabzeichen" icon={<Medal size={17} />} label="Sportabzeichen" />
        <SchnellLink href="/stoppuhr" icon={<Timer size={17} />} label="Stoppuhr" />
        <SchnellLink href="/trainings" icon={<ClipboardList size={17} />} label="Trainingslog" />
        <SchnellLink href="/teilnehmer" icon={<ArrowRight size={17} />} label="Teilnehmer" />
      </div>
    </div>
  );
}

function Kennzahl({ zahl, label, href }: { zahl: number; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300"
    >
      <p className="tabular text-2xl font-semibold tracking-tight text-slate-900">{zahl}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </Link>
  );
}

function SchnellLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:text-sky-800"
    >
      <span className="text-sky-700">{icon}</span>
      {label}
    </Link>
  );
}
