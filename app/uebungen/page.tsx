"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import type { Abschnitt, Anlage, Disziplin, Uebung } from "@/lib/types";
import {
  ABSCHNITTE,
  ANLAGEN,
  DISZIPLINEN,
  abschnittLabel,
  anlageLabel,
  disziplinLabel,
} from "@/lib/labels";
import { einsaetzeFuerUebung, useDaten } from "@/lib/store";
import UebungCard from "@/components/UebungCard";
import UebungDetail from "@/components/UebungDetail";
import {
  LeererHinweis,
  SeitenKopf,
  eingabeKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

interface Filter {
  suche: string;
  abschnitte: Abschnitt[];
  disziplinen: Disziplin[];
  ort: "alle" | "drinnen" | "draussen";
  /** Anlagen, die heute NICHT verfügbar sind. */
  anlagenFehlen: Anlage[];
  ohneMaterial: boolean;
  nurFavoriten: boolean;
  alter: string;
  gruppe: string;
}

const STANDARD_FILTER: Filter = {
  suche: "",
  abschnitte: [],
  disziplinen: [],
  ort: "alle",
  anlagenFehlen: [],
  ohneMaterial: false,
  nurFavoriten: false,
  alter: "",
  gruppe: "",
};

type Sortierung = "abschnitt" | "titel" | "zuletzt" | "dauer";

export default function UebungenSeite() {
  const { daten, bereit } = useDaten();
  const [filter, setFilter] = useState<Filter>(STANDARD_FILTER);
  const [sortierung, setSortierung] = useState<Sortierung>("abschnitt");
  const [offeneUebung, setOffeneUebung] = useState<string | null>(null);
  const [mobilOffen, setMobilOffen] = useState(false);

  const gefiltert = useMemo(
    () => filtern(daten.uebungen, filter, sortierung, daten.trainings),
    [daten.uebungen, daten.trainings, filter, sortierung]
  );

  const aktiveChips = aktiveFilterChips(filter);

  if (!bereit) return null;

  const filterInhalt = (
    <FilterSpalte filter={filter} setFilter={setFilter} uebungen={daten.uebungen} />
  );

  return (
    <div>
      <SeitenKopf
        titel="Übungsdatenbank"
        beschreibung={`${daten.uebungen.length} Übungen für die Kinderleichtathletik`}
        aktionen={
          <Link href="/uebungen/neu" className={primaerKnopf}>
            <Plus size={15} />
            Neue Übung
          </Link>
        }
      />

      <div className="flex gap-6">
        {/* Facetten (Desktop) */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-6 rounded-lg border border-slate-200 bg-white p-4">
            {filterInhalt}
          </div>
        </aside>

        {/* Ergebnisse */}
        <div className="min-w-0 flex-1">
          {/* Werkzeugleiste */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={filter.suche}
                onChange={(e) => setFilter({ ...filter, suche: e.target.value })}
                placeholder="Titel, Beschreibung oder Material durchsuchen …"
                className={`${eingabeKlasse} w-full pl-8`}
              />
            </div>
            <button
              type="button"
              onClick={() => setMobilOffen(true)}
              className={`${sekundaerKnopf} lg:hidden`}
            >
              <SlidersHorizontal size={15} />
              Filter
              {aktiveChips.length > 0 && (
                <span className="rounded-full bg-sky-700 px-1.5 text-[10px] font-semibold text-white">
                  {aktiveChips.length}
                </span>
              )}
            </button>
            <select
              value={sortierung}
              onChange={(e) => setSortierung(e.target.value as Sortierung)}
              className={eingabeKlasse}
              title="Sortierung"
            >
              <option value="abschnitt">Nach Trainingsablauf</option>
              <option value="titel">Nach Titel</option>
              <option value="zuletzt">Zuletzt eingesetzt</option>
              <option value="dauer">Nach Dauer</option>
            </select>
          </div>

          {/* Aktive Filter */}
          {aktiveChips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {aktiveChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setFilter(chip.entfernen(filter))}
                  className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-900 transition-colors hover:bg-sky-100"
                >
                  {chip.label}
                  <X size={12} />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFilter(STANDARD_FILTER)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline"
              >
                Alle zurücksetzen
              </button>
            </div>
          )}

          <p className="mt-3 text-sm text-slate-500">
            <span className="font-medium text-slate-700">{gefiltert.length}</span> von{" "}
            {daten.uebungen.length} Übungen
          </p>

          {gefiltert.length === 0 ? (
            <div className="mt-3">
              <LeererHinweis
                titel="Keine passende Übung gefunden"
                text="Lockere einzelne Filter – oder lege die Übung, die dir vorschwebt, direkt selbst an."
              >
                <Link href="/uebungen/neu" className={primaerKnopf}>
                  <Plus size={15} />
                  Neue Übung anlegen
                </Link>
              </LeererHinweis>
            </div>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gefiltert.map((u) => (
                <UebungCard key={u.id} uebung={u} onOeffnen={() => setOffeneUebung(u.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Facetten (Mobil) */}
      {mobilOffen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 lg:hidden"
          onClick={() => setMobilOffen(false)}
        >
          <div
            className="h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Filter</h2>
              <button
                type="button"
                onClick={() => setMobilOffen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            {filterInhalt}
            <button
              type="button"
              onClick={() => setMobilOffen(false)}
              className={`${primaerKnopf} mt-4 w-full`}
            >
              {gefiltert.length} Übungen anzeigen
            </button>
          </div>
        </div>
      )}

      {offeneUebung && (
        <UebungDetail uebungId={offeneUebung} onSchliessen={() => setOffeneUebung(null)} />
      )}
    </div>
  );
}

// ===== Facetten-Spalte =====

function FilterSpalte({
  filter,
  setFilter,
  uebungen,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
  uebungen: Uebung[];
}) {
  const anzahl = (pruefen: (u: Uebung) => boolean) => uebungen.filter(pruefen).length;

  function umschalten<T>(liste: T[], wert: T): T[] {
    return liste.includes(wert) ? liste.filter((x) => x !== wert) : [...liste, wert];
  }

  return (
    <div className="space-y-5">
      <FacettenGruppe titel="Trainingsabschnitt">
        {ABSCHNITTE.map((a) => (
          <FacettenOption
            key={a.wert}
            label={a.label}
            anzahl={anzahl((u) => u.abschnitt === a.wert)}
            aktiv={filter.abschnitte.includes(a.wert)}
            onToggle={() =>
              setFilter({ ...filter, abschnitte: umschalten(filter.abschnitte, a.wert) })
            }
          />
        ))}
      </FacettenGruppe>

      <FacettenGruppe titel="Disziplin">
        {DISZIPLINEN.map((d) => (
          <FacettenOption
            key={d.wert}
            label={d.label}
            anzahl={anzahl((u) => u.disziplinen.includes(d.wert))}
            aktiv={filter.disziplinen.includes(d.wert)}
            onToggle={() =>
              setFilter({ ...filter, disziplinen: umschalten(filter.disziplinen, d.wert) })
            }
          />
        ))}
      </FacettenGruppe>

      <FacettenGruppe titel="Ort">
        {(
          [
            ["alle", "Egal"],
            ["draussen", "Draußen (Platz)"],
            ["drinnen", "Drinnen (Halle)"],
          ] as const
        ).map(([wert, label]) => (
          <label
            key={wert}
            className="flex cursor-pointer items-center gap-2 py-0.5 text-sm text-slate-700"
          >
            <input
              type="radio"
              name="ort"
              checked={filter.ort === wert}
              onChange={() => setFilter({ ...filter, ort: wert })}
              className="h-3.5 w-3.5 accent-sky-700"
            />
            {label}
          </label>
        ))}
      </FacettenGruppe>

      <FacettenGruppe titel="Verfügbare Anlagen" hinweis="Abwählen, was heute fehlt">
        {ANLAGEN.map((a) => (
          <label
            key={a.wert}
            className="flex cursor-pointer items-center gap-2 py-0.5 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={!filter.anlagenFehlen.includes(a.wert)}
              onChange={() =>
                setFilter({
                  ...filter,
                  anlagenFehlen: umschalten(filter.anlagenFehlen, a.wert),
                })
              }
              className="h-3.5 w-3.5 accent-sky-700"
            />
            {a.label}
          </label>
        ))}
      </FacettenGruppe>

      <FacettenGruppe titel="Weitere Kriterien">
        <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filter.ohneMaterial}
            onChange={(e) => setFilter({ ...filter, ohneMaterial: e.target.checked })}
            className="h-3.5 w-3.5 accent-sky-700"
          />
          Nur ohne Material
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filter.nurFavoriten}
            onChange={(e) => setFilter({ ...filter, nurFavoriten: e.target.checked })}
            className="h-3.5 w-3.5 accent-sky-700"
          />
          Nur Favoriten
        </label>
        <div className="mt-2 flex gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Alter (Jahre)
            <input
              type="number"
              min={4}
              max={17}
              value={filter.alter}
              onChange={(e) => setFilter({ ...filter, alter: e.target.value })}
              placeholder="z. B. 9"
              className={`${eingabeKlasse} py-1.5`}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Gruppengröße
            <input
              type="number"
              min={1}
              value={filter.gruppe}
              onChange={(e) => setFilter({ ...filter, gruppe: e.target.value })}
              placeholder="z. B. 12"
              className={`${eingabeKlasse} py-1.5`}
            />
          </label>
        </div>
      </FacettenGruppe>
    </div>
  );
}

function FacettenGruppe({
  titel,
  hinweis,
  children,
}: {
  titel: string;
  hinweis?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titel}</p>
      {hinweis && <p className="mt-0.5 text-[11px] text-slate-400">{hinweis}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function FacettenOption({
  label,
  anzahl,
  aktiv,
  onToggle,
}: {
  label: string;
  anzahl: number;
  aktiv: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={aktiv}
        onChange={onToggle}
        className="h-3.5 w-3.5 accent-sky-700"
      />
      <span className="flex-1">{label}</span>
      <span className="tabular text-xs text-slate-400">{anzahl}</span>
    </label>
  );
}

// ===== Filterlogik =====

function filtern(
  uebungen: Uebung[],
  filter: Filter,
  sortierung: Sortierung,
  trainings: Parameters<typeof einsaetzeFuerUebung>[0]
): Uebung[] {
  const s = filter.suche.trim().toLowerCase();
  const ordnung = ABSCHNITTE.map((x) => x.wert);

  const ergebnis = uebungen.filter((u) => {
    if (filter.abschnitte.length > 0 && !filter.abschnitte.includes(u.abschnitt)) return false;
    if (
      filter.disziplinen.length > 0 &&
      !filter.disziplinen.some((d) => u.disziplinen.includes(d))
    )
      return false;
    if (filter.ort !== "alle" && u.ort !== "beides" && u.ort !== filter.ort) return false;
    if (u.anlagen.some((a) => filter.anlagenFehlen.includes(a))) return false;
    if (filter.ohneMaterial && u.material.length > 0) return false;
    if (filter.nurFavoriten && !u.favorit) return false;
    const alter = parseInt(filter.alter, 10);
    if (!isNaN(alter) && (alter < u.altersVon || alter > u.altersBis)) return false;
    const gruppe = parseInt(filter.gruppe, 10);
    if (!isNaN(gruppe)) {
      if (gruppe < u.gruppeMin) return false;
      if (u.gruppeMax !== null && gruppe > u.gruppeMax) return false;
    }
    if (
      s &&
      !u.titel.toLowerCase().includes(s) &&
      !u.beschreibung.toLowerCase().includes(s) &&
      !u.material.some((m) => m.toLowerCase().includes(s))
    )
      return false;
    return true;
  });

  const zuletzt = (u: Uebung) =>
    einsaetzeFuerUebung(trainings, u.id)[0]?.training.datum ?? "";

  return ergebnis.sort((a, b) => {
    switch (sortierung) {
      case "titel":
        return a.titel.localeCompare(b.titel, "de");
      case "dauer":
        return a.dauer - b.dauer || a.titel.localeCompare(b.titel, "de");
      case "zuletzt":
        return zuletzt(b).localeCompare(zuletzt(a)) || a.titel.localeCompare(b.titel, "de");
      default:
        return (
          ordnung.indexOf(a.abschnitt) - ordnung.indexOf(b.abschnitt) ||
          Number(b.favorit) - Number(a.favorit) ||
          a.titel.localeCompare(b.titel, "de")
        );
    }
  });
}

function aktiveFilterChips(filter: Filter): {
  key: string;
  label: string;
  entfernen: (f: Filter) => Filter;
}[] {
  const chips: { key: string; label: string; entfernen: (f: Filter) => Filter }[] = [];
  for (const a of filter.abschnitte) {
    chips.push({
      key: `abschnitt-${a}`,
      label: abschnittLabel(a),
      entfernen: (f) => ({ ...f, abschnitte: f.abschnitte.filter((x) => x !== a) }),
    });
  }
  for (const d of filter.disziplinen) {
    chips.push({
      key: `disziplin-${d}`,
      label: disziplinLabel(d),
      entfernen: (f) => ({ ...f, disziplinen: f.disziplinen.filter((x) => x !== d) }),
    });
  }
  if (filter.ort !== "alle") {
    chips.push({
      key: "ort",
      label: filter.ort === "draussen" ? "Draußen" : "Drinnen",
      entfernen: (f) => ({ ...f, ort: "alle" }),
    });
  }
  for (const a of filter.anlagenFehlen) {
    chips.push({
      key: `anlage-${a}`,
      label: `ohne ${anlageLabel(a)}`,
      entfernen: (f) => ({ ...f, anlagenFehlen: f.anlagenFehlen.filter((x) => x !== a) }),
    });
  }
  if (filter.ohneMaterial) {
    chips.push({
      key: "ohne-material",
      label: "ohne Material",
      entfernen: (f) => ({ ...f, ohneMaterial: false }),
    });
  }
  if (filter.nurFavoriten) {
    chips.push({
      key: "favoriten",
      label: "Favoriten",
      entfernen: (f) => ({ ...f, nurFavoriten: false }),
    });
  }
  if (filter.alter) {
    chips.push({
      key: "alter",
      label: `${filter.alter} Jahre`,
      entfernen: (f) => ({ ...f, alter: "" }),
    });
  }
  if (filter.gruppe) {
    chips.push({
      key: "gruppe",
      label: `${filter.gruppe} Kinder`,
      entfernen: (f) => ({ ...f, gruppe: "" }),
    });
  }
  return chips;
}
