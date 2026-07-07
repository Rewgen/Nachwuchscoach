"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search, Star } from "lucide-react";
import type { Abschnitt } from "@/lib/types";
import { ABSCHNITTE } from "@/lib/labels";
import { useDaten } from "@/lib/store";
import { AbschnittBadge, eingabeKlasse } from "./ui";

/** Kompakte Übungs-Suche zum Hinzufügen in den Trainingsplaner. */
export default function UebungPicker({
  gewaehlt,
  onHinzufuegen,
}: {
  gewaehlt: string[];
  onHinzufuegen: (uebungId: string) => void;
}) {
  const { daten } = useDaten();
  const [suche, setSuche] = useState("");
  const [abschnitt, setAbschnitt] = useState<Abschnitt | "alle">("alle");

  const treffer = useMemo(() => {
    const s = suche.trim().toLowerCase();
    return daten.uebungen
      .filter((u) => (abschnitt === "alle" ? true : u.abschnitt === abschnitt))
      .filter(
        (u) =>
          !s ||
          u.titel.toLowerCase().includes(s) ||
          u.beschreibung.toLowerCase().includes(s)
      )
      .sort(
        (a, b) =>
          Number(b.favorit) - Number(a.favorit) || a.titel.localeCompare(b.titel, "de")
      );
  }, [daten.uebungen, suche, abschnitt]);

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-40 flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Übung suchen …"
            className={`${eingabeKlasse} w-full pl-8`}
          />
        </div>
        <select
          value={abschnitt}
          onChange={(e) => setAbschnitt(e.target.value as Abschnitt | "alle")}
          className={eingabeKlasse}
        >
          <option value="alle">Alle Abschnitte</option>
          {ABSCHNITTE.map((a) => (
            <option key={a.wert} value={a.wert}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1">
        {treffer.map((u) => {
          const istGewaehlt = gewaehlt.includes(u.id);
          return (
            <li
              key={u.id}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5"
            >
              <AbschnittBadge abschnitt={u.abschnitt} />
              <span className="flex-1 truncate text-sm font-medium text-slate-800">
                {u.favorit && (
                  <Star size={12} className="mr-1 inline text-amber-500" fill="currentColor" />
                )}
                {u.titel}
              </span>
              <span className="tabular hidden text-xs text-slate-400 sm:inline">
                {u.dauer} Min.
              </span>
              <button
                type="button"
                disabled={istGewaehlt}
                onClick={() => onHinzufuegen(u.id)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  istGewaehlt
                    ? "cursor-default text-emerald-700"
                    : "bg-sky-700 text-white hover:bg-sky-800"
                }`}
              >
                {istGewaehlt ? <Check size={13} /> : <Plus size={13} />}
                {istGewaehlt ? "Drin" : "Hinzufügen"}
              </button>
            </li>
          );
        })}
        {treffer.length === 0 && (
          <li className="px-3 py-4 text-center text-sm text-slate-400">
            Keine Übung gefunden.
          </li>
        )}
      </ul>
    </div>
  );
}
