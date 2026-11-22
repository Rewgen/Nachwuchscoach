"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Gauge,
  Lightbulb,
  MapPin,
  Package,
  Shapes,
  Shuffle,
  Target,
  Users,
} from "lucide-react";
import { aehnliche, alterText, INTENSITAET_LABEL, label } from "@/lib/katalog";
import { useSpeicher } from "@/lib/speicher";
import { uebungNachId } from "@/lib/uebungen";
import Skizze from "@/components/Skizze";
import SkizzenLegende from "@/components/SkizzenLegende";
import UebungKarte from "@/components/UebungKarte";
import { FavoritKnopf, IntensitaetBalken, SchwerpunktMarke, TrainingKnopf } from "@/components/ui";

export default function UebungSeite() {
  return (
    <Suspense fallback={null}>
      <UebungInhalt />
    </Suspense>
  );
}

function UebungInhalt() {
  const id = useSearchParams().get("id") ?? "";
  const u = uebungNachId(id);
  const { favoriten, favoritUmschalten, aufMerkliste, merkUmschalten } = useSpeicher();

  if (!u) {
    return (
      <div className="py-20 text-center">
        <p className="font-medium text-slate-900">Diese Übung gibt es nicht (mehr).</p>
        <Link href="/" className="mt-3 inline-block text-sm font-medium text-sky-700">
          Zur Übersicht
        </Link>
      </div>
    );
  }

  const passend = aehnliche(u);

  return (
    <article className="print-flaeche">
      <Link
        href="/"
        className="print-verbergen mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle Übungen
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <Skizze elemente={u.skizze} titel={u.titel} className="block h-auto w-full" />
          </div>
          <div className="mt-3 px-1">
            <SkizzenLegende elemente={u.skizze} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {label.stundenteil(u.stundenteil)} · {label.form(u.form)}
            </span>
            {u.schwerpunkte.map((s) => (
              <SchwerpunktMarke key={s} s={s} />
            ))}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{u.titel}</h1>
          <p className="mt-2 text-[17px] leading-relaxed text-slate-600">{u.kurz}</p>

          <div className="print-verbergen mt-5 flex flex-wrap gap-2">
            <TrainingKnopf gross aktiv={aufMerkliste(u.id)} onClick={() => merkUmschalten(u.id)} />
            <FavoritKnopf gross aktiv={favoriten.has(u.id)} onClick={() => favoritUmschalten(u.id)} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
            <Kennzahl icon={<Clock className="h-4 w-4" />} titel="Dauer" wert={`ca. ${u.dauer} min`} />
            <Kennzahl icon={<Users className="h-4 w-4" />} titel="Alter" wert={alterText(u)} />
            <Kennzahl
              icon={<Users className="h-4 w-4" />}
              titel="Gruppe"
              wert={`ab ${u.gruppeMin} ${u.gruppeMin === 1 ? "Kind" : "Kinder"}`}
            />
            <Kennzahl
              icon={<Gauge className="h-4 w-4" />}
              titel="Intensität"
              wert={
                <span className="inline-flex items-center gap-2">
                  <IntensitaetBalken wert={u.intensitaet} />
                  {INTENSITAET_LABEL[u.intensitaet]}
                </span>
              }
            />
          </dl>

          <div className="mt-6 space-y-4 text-sm">
            <Zeile icon={<Target className="h-4 w-4" />} titel="Ziel">
              {u.ziel}
            </Zeile>
            <Zeile icon={<MapPin className="h-4 w-4" />} titel="Ort">
              {label.ort(u.ort)}
            </Zeile>
            <Zeile icon={<Package className="h-4 w-4" />} titel="Material">
              {u.material.length === 0 ? (
                "Kein Material nötig"
              ) : (
                <span className="flex flex-wrap gap-1.5">
                  {u.material.map((m) => (
                    <span key={m} className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
                      {m}
                    </span>
                  ))}
                </span>
              )}
            </Zeile>
            <Zeile icon={<Shapes className="h-4 w-4" />} titel="Aufbau">
              {u.aufbau}
            </Zeile>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Ablauf</h2>
          <ol className="space-y-3">
            {u.ablauf.map((schritt, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-700 text-xs font-semibold text-white tabular">
                  {i + 1}
                </span>
                <p className="pt-0.5 leading-relaxed text-slate-700">{schritt}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-6">
          {u.tipps.length > 0 && (
            <section className="rounded-lg border border-amber-200 bg-amber-50/60 p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-amber-900">
                <Lightbulb className="h-4 w-4" />
                Coaching-Tipps
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-amber-950/80">
                {u.tipps.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-700" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {u.variationen.length > 0 && (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                <Shuffle className="h-4 w-4" />
                Variationen
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
                {u.variationen.map((v, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    {v}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {passend.length > 0 && (
        <section className="print-verbergen mt-14 border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Passt dazu</h2>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {passend.map((x) => (
              <UebungKarte key={x.id} u={x} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function Kennzahl({ icon, titel, wert }: { icon: React.ReactNode; titel: string; wert: React.ReactNode }) {
  return (
    <div className="bg-white px-3.5 py-3">
      <dt className="flex items-center gap-1.5 text-xs text-slate-500">
        {icon}
        {titel}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{wert}</dd>
    </div>
  );
}

function Zeile({ icon, titel, children }: { icon: React.ReactNode; titel: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{titel}</div>
        <div className="mt-1 leading-relaxed text-slate-700">{children}</div>
      </div>
    </div>
  );
}
