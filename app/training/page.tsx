"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  Link2,
  Package,
  Printer,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { INTENSITAET_LABEL, materialliste, STUNDENTEILE } from "@/lib/katalog";
import { useSpeicher } from "@/lib/speicher";
import type { MerkEintrag, Stundenteil, Uebung } from "@/lib/types";
import { uebungNachId } from "@/lib/uebungen";
import Skizze from "@/components/Skizze";
import { IntensitaetBalken, SchwerpunktMarke } from "@/components/ui";

const TEIL_FARBE: Record<Stundenteil, string> = {
  aufwaermen: "bg-amber-400",
  hauptteil: "bg-sky-700",
  abschluss: "bg-emerald-500",
};

export default function TrainingSeite() {
  return (
    <Suspense fallback={null}>
      <TrainingInhalt />
    </Suspense>
  );
}

function TrainingInhalt() {
  const s = useSpeicher();
  const router = useRouter();
  const geteilt = useSearchParams().get("liste");
  const [hinweis, setHinweis] = useState("");
  const [abgehakt, setAbgehakt] = useState<Set<string>>(new Set());

  const eintraege = s.merkliste
    .map((e) => ({ e, u: uebungNachId(e.id) }))
    .filter((x): x is { e: MerkEintrag; u: Uebung } => !!x.u);
  const uebungen = eintraege.map((x) => x.u);
  const gesamt = uebungen.reduce((sum, u) => sum + u.dauer, 0);
  const material = materialliste(uebungen);

  const geteilteIds = geteilt ? geteilt.split(",").filter((id) => uebungNachId(id)) : [];
  const zeigeImport =
    s.bereit &&
    geteilteIds.length > 0 &&
    geteilteIds.join(",") !== s.merkliste.map((e) => e.id).join(",");

  async function teilen() {
    const url = `${window.location.origin}/training?liste=${s.merkliste.map((e) => e.id).join(",")}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Training", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setHinweis("Link kopiert – z. B. aufs Handy schicken.");
    } catch {
      setHinweis(url);
    }
    setTimeout(() => setHinweis(""), 4000);
  }

  if (!s.bereit) return null;

  return (
    <div>
      {zeigeImport && (
        <div className="print-verbergen mb-6 flex flex-col gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-sky-950">
            <span className="font-semibold">Geteiltes Training mit {geteilteIds.length} Übungen.</span>{" "}
            {s.merkliste.length > 0 && "Deine aktuelle Liste wird dabei ersetzt."}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                s.merklisteSetzen(geteilteIds);
                router.replace("/training");
              }}
              className="h-9 rounded-md bg-sky-700 px-3.5 text-sm font-medium text-white hover:bg-sky-800"
            >
              Übernehmen
            </button>
            <button
              type="button"
              onClick={() => router.replace("/training")}
              className="h-9 rounded-md border border-sky-200 bg-white px-3.5 text-sm font-medium text-sky-900"
            >
              Ignorieren
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Nächstes Training</h1>
          <p className="mt-1 text-sm text-slate-500 print-verbergen">
            Übungen aus dem Katalog sammeln – sortiert nach Stundenteil, am Platz abhaken.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="print-verbergen">Datum</span>
          <input
            type="date"
            value={s.trainingDatum}
            onChange={(e) => s.setTrainingDatum(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
          />
        </label>
      </div>

      {eintraege.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="font-medium text-slate-900">Noch keine Übungen ausgewählt.</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Im Katalog bei einer Übung auf „Training“ tippen. Ein guter Rahmen für 60–90 Minuten:
            1–2 Aufwärmspiele, 2–3 Hauptteil-Übungen, ein Abschluss.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-sky-700 px-4 text-sm font-medium text-white hover:bg-sky-800"
          >
            <Search className="h-4 w-4" />
            Übungen durchsuchen
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-8">
            {STUNDENTEILE.map((teil) => {
              const gruppe = eintraege.filter((x) => x.u.stundenteil === teil.wert);
              const minuten = gruppe.reduce((sum, x) => sum + x.u.dauer, 0);
              return (
                <section key={teil.wert}>
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-sm ${TEIL_FARBE[teil.wert]}`} />
                    <h2 className="font-semibold text-slate-900">{teil.label}</h2>
                    <span className="text-sm text-slate-400 tabular">
                      {gruppe.length > 0 ? `${minuten} min` : ""}
                    </span>
                  </div>
                  {gruppe.length === 0 ? (
                    <Link
                      href="/"
                      onClick={() => s.setFilter((alt) => ({ ...alt, stundenteile: [teil.wert] }))}
                      className="print-verbergen block rounded-lg border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700"
                    >
                      + Übung für „{teil.label}“ auswählen
                    </Link>
                  ) : (
                    <ul className="space-y-2.5">
                      {gruppe.map(({ e, u }, i) => (
                        <Eintrag
                          key={u.id}
                          u={u}
                          erledigt={e.erledigt}
                          hoch={i > 0 ? () => s.merkTauschen(u.id, gruppe[i - 1].u.id) : undefined}
                          runter={
                            i < gruppe.length - 1
                              ? () => s.merkTauschen(u.id, gruppe[i + 1].u.id)
                              : undefined
                          }
                          erledigtUmschalten={() => s.merkErledigt(u.id)}
                          entfernen={() => s.merkEntfernen(u.id)}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-500">Gesamt</span>
                <span className="text-2xl font-semibold tracking-tight text-slate-900 tabular">
                  {gesamt} <span className="text-base font-normal text-slate-500">min</span>
                </span>
              </div>
              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-100">
                {STUNDENTEILE.map((t) => {
                  const min = uebungen
                    .filter((u) => u.stundenteil === t.wert)
                    .reduce((sum, u) => sum + u.dauer, 0);
                  return min > 0 ? (
                    <div
                      key={t.wert}
                      className={TEIL_FARBE[t.wert]}
                      style={{ width: `${(min / gesamt) * 100}%` }}
                      title={`${t.label}: ${min} min`}
                    />
                  ) : null;
                })}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {uebungen.length} Übungen · reine Übungszeit ohne Erklären und Wechsel
              </p>

              <div className="print-verbergen mt-5 grid grid-cols-3 gap-2">
                <Aktion onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>
                  Drucken
                </Aktion>
                <Aktion onClick={teilen} icon={<Link2 className="h-4 w-4" />}>
                  Teilen
                </Aktion>
                <Aktion
                  onClick={() => {
                    if (confirm("Alle Übungen aus dem Training entfernen?")) s.merklisteLeeren();
                  }}
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Leeren
                </Aktion>
              </div>
              {hinweis && <p className="mt-3 break-all text-xs text-emerald-700">{hinweis}</p>}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                <Package className="h-4 w-4 text-slate-400" />
                Material einpacken
              </h2>
              {material.length === 0 ? (
                <p className="text-sm text-slate-500">Kein Material nötig.</p>
              ) : (
                <ul className="space-y-1">
                  {material.map((m) => {
                    const drin = abgehakt.has(m);
                    return (
                      <li key={m}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={drin}
                            onChange={() =>
                              setAbgehakt((alt) => {
                                const neu = new Set(alt);
                                if (neu.has(m)) neu.delete(m);
                                else neu.add(m);
                                return neu;
                              })
                            }
                            className="h-4 w-4 rounded border-slate-300 accent-sky-700"
                          />
                          <span className={drin ? "text-slate-400 line-through" : "text-slate-700"}>{m}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Aktion({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-md border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    >
      {icon}
      {children}
    </button>
  );
}

function Eintrag({
  u,
  erledigt,
  hoch,
  runter,
  erledigtUmschalten,
  entfernen,
}: {
  u: Uebung;
  erledigt: boolean;
  hoch?: () => void;
  runter?: () => void;
  erledigtUmschalten: () => void;
  entfernen: () => void;
}) {
  const [offen, setOffen] = useState(false);

  return (
    <li
      className={`break-inside-avoid rounded-lg border bg-white transition ${
        erledigt ? "border-slate-200 opacity-60" : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          onClick={erledigtUmschalten}
          aria-pressed={erledigt}
          title={erledigt ? "Als offen markieren" : "Als erledigt abhaken"}
          className={`print-verbergen mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
            erledigt ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white hover:border-slate-400"
          }`}
        >
          {erledigt && <Check className="h-4 w-4" />}
        </button>
        <Link href={`/uebung?id=${u.id}`} className="hidden w-28 shrink-0 sm:block">
          <Skizze elemente={u.skizze} titel={u.titel} className="block h-auto w-full" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/uebung?id=${u.id}`}
            className={`font-semibold tracking-tight hover:text-sky-800 ${
              erledigt ? "text-slate-500 line-through" : "text-slate-900"
            }`}
          >
            {u.titel}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 tabular">
              <Clock className="h-3.5 w-3.5" />
              {u.dauer} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IntensitaetBalken wert={u.intensitaet} />
              {INTENSITAET_LABEL[u.intensitaet]}
            </span>
            {u.schwerpunkte.slice(0, 2).map((sp) => (
              <SchwerpunktMarke key={sp} s={sp} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOffen((o) => !o)}
            className="print-verbergen mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900"
          >
            Ablauf {offen ? "ausblenden" : "anzeigen"}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${offen ? "rotate-180" : ""}`} />
          </button>
        </div>
        <div className="print-verbergen flex shrink-0 flex-col gap-1 sm:flex-row">
          <IconKnopf onClick={hoch} titel="Nach oben">
            <ArrowUp className="h-4 w-4" />
          </IconKnopf>
          <IconKnopf onClick={runter} titel="Nach unten">
            <ArrowDown className="h-4 w-4" />
          </IconKnopf>
          <IconKnopf onClick={entfernen} titel="Entfernen">
            <X className="h-4 w-4" />
          </IconKnopf>
        </div>
      </div>
      <div className={`${offen ? "block" : "hidden"} print:block border-t border-slate-100 px-4 py-3`}>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
          {u.ablauf.map((schritt, i) => (
            <li key={i}>{schritt}</li>
          ))}
        </ol>
        {u.material.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">Material: {u.material.join(", ")}</p>
        )}
      </div>
    </li>
  );
}

function IconKnopf({
  onClick,
  titel,
  children,
}: {
  onClick?: () => void;
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={titel}
      aria-label={titel}
      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
