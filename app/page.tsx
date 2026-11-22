"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import {
  aktiveFilterAnzahl,
  filtern,
  LEERER_FILTER,
  SCHWERPUNKTE,
  SORTIERUNGEN,
  STUNDENTEILE,
  type Sortierung,
} from "@/lib/katalog";
import { useSpeicher } from "@/lib/speicher";
import type { Stundenteil } from "@/lib/types";
import { UEBUNGEN } from "@/lib/uebungen";
import FilterPanel from "@/components/FilterPanel";
import UebungKarte from "@/components/UebungKarte";
import { Chip } from "@/components/ui";

export default function KatalogSeite() {
  const { filter, setFilter, favoriten, fehlendesMaterial } = useSpeicher();
  const [panelOffen, setPanelOffen] = useState(false);

  const treffer = useMemo(
    () => filtern(UEBUNGEN, filter, favoriten, fehlendesMaterial),
    [filter, favoriten, fehlendesMaterial]
  );

  // Zähler pro Stundenteil: alle Filter außer dem Stundenteil selbst.
  const proTeil = useMemo(() => {
    const ohneTeil = filtern(UEBUNGEN, { ...filter, stundenteile: [] }, favoriten, fehlendesMaterial);
    const z: Record<string, number> = { alle: ohneTeil.length };
    for (const u of ohneTeil) z[u.stundenteil] = (z[u.stundenteil] ?? 0) + 1;
    return z;
  }, [filter, favoriten, fehlendesMaterial]);

  const panelFilter = aktiveFilterAnzahl({ ...filter, stundenteile: [], schwerpunkte: [] });
  const irgendeinFilter =
    aktiveFilterAnzahl(filter) > 0 || filter.suche.trim() !== "" || fehlendesMaterial.size > 0;

  const teilWaehlen = (t: Stundenteil | null) =>
    setFilter((alt) => ({ ...alt, stundenteile: t ? [t] : [] }));

  return (
    <div>
      <div className="mb-5 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Übungen</h1>
        <p className="text-sm text-slate-500">
          {UEBUNGEN.length} Spiele und Übungen für Kinder- und Jugendleichtathletik – mit Aufbau-Skizze,
          Ablauf und Variationen.
        </p>
      </div>

      {/* Suche + Sortierung */}
      <div className="flex gap-2">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filter.suche}
            onChange={(e) => setFilter((alt) => ({ ...alt, suche: e.target.value }))}
            placeholder="Suchen: Staffel, Hürden, Reifen, Fangspiel …"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/15"
          />
        </label>
        <label className="relative hidden sm:block">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={filter.sortierung}
            onChange={(e) =>
              setFilter((alt) => ({ ...alt, sortierung: e.target.value as Sortierung }))
            }
            className="h-11 appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 focus:border-sky-600 focus:outline-none"
            aria-label="Sortierung"
          >
            {SORTIERUNGEN.map((s) => (
              <option key={s.wert} value={s.wert}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setPanelOffen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {panelFilter > 0 && (
            <span className="rounded-full bg-sky-700 px-1.5 text-[11px] font-semibold text-white">
              {panelFilter}
            </span>
          )}
        </button>
      </div>

      {/* Stundenteil */}
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200">
        <TeilTab aktiv={filter.stundenteile.length === 0} onClick={() => teilWaehlen(null)} anzahl={proTeil.alle ?? 0}>
          Alle
        </TeilTab>
        {STUNDENTEILE.map((t) => (
          <TeilTab
            key={t.wert}
            aktiv={filter.stundenteile.includes(t.wert)}
            onClick={() => teilWaehlen(t.wert)}
            anzahl={proTeil[t.wert] ?? 0}
          >
            {t.label}
          </TeilTab>
        ))}
      </div>

      {/* Schwerpunkte */}
      <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {SCHWERPUNKTE.map((s) => {
          const aktiv = filter.schwerpunkte.includes(s.wert);
          return (
            <Chip
              key={s.wert}
              aktiv={aktiv}
              onClick={() =>
                setFilter((alt) => ({
                  ...alt,
                  schwerpunkte: aktiv
                    ? alt.schwerpunkte.filter((x) => x !== s.wert)
                    : [...alt.schwerpunkte, s.wert],
                }))
              }
            >
              <span className={`h-2 w-2 rounded-full ${s.farbe} ${aktiv ? "ring-2 ring-white/70" : ""}`} />
              {s.label}
            </Chip>
          );
        })}
      </div>

      <div className="mt-6 flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20">
            <FilterPanel />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500 tabular">
              <span className="font-semibold text-slate-900">{treffer.length}</span>{" "}
              {treffer.length === 1 ? "Übung" : "Übungen"}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={filter.sortierung}
                onChange={(e) =>
                  setFilter((alt) => ({ ...alt, sortierung: e.target.value as Sortierung }))
                }
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 sm:hidden"
                aria-label="Sortierung"
              >
                {SORTIERUNGEN.map((s) => (
                  <option key={s.wert} value={s.wert}>
                    {s.label}
                  </option>
                ))}
              </select>
              {irgendeinFilter && (
                <button
                  type="button"
                  onClick={() => setFilter({ ...LEERER_FILTER, sortierung: filter.sortierung })}
                  className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-900"
                >
                  <X className="h-3.5 w-3.5" />
                  Zurücksetzen
                </button>
              )}
            </div>
          </div>

          {treffer.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="font-medium text-slate-900">Keine Übung passt zu diesen Filtern.</p>
              <p className="mt-1 text-sm text-slate-500">
                Filter lockern oder bei „Vorhandenes Material“ prüfen, ob zu viel abgewählt ist.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {treffer.map((u) => (
                <UebungKarte key={u.id} u={u} />
              ))}
            </div>
          )}
        </section>
      </div>

      {panelOffen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setPanelOffen(false)}
            aria-label="Filter schließen"
          />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="font-semibold text-slate-900">Filter</span>
              <button
                type="button"
                onClick={() => setPanelOffen(false)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <FilterPanel />
            </div>
            <div className="border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={() => setPanelOffen(false)}
                className="h-11 w-full rounded-lg bg-sky-700 text-sm font-semibold text-white hover:bg-sky-800"
              >
                {treffer.length} {treffer.length === 1 ? "Übung" : "Übungen"} anzeigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeilTab({
  aktiv,
  onClick,
  anzahl,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  anzahl: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        aktiv
          ? "border-sky-700 text-slate-900"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
      <span className={`text-xs tabular ${aktiv ? "text-sky-700" : "text-slate-400"}`}>{anzahl}</span>
    </button>
  );
}
