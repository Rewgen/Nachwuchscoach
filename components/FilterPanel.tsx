"use client";

import { useState } from "react";
import { ChevronDown, Heart } from "lucide-react";
import {
  ALLE_MATERIALIEN,
  ALTERSKLASSEN,
  DAUERN,
  FORMEN,
  ORTE,
  type Filter,
} from "@/lib/katalog";
import { useSpeicher } from "@/lib/speicher";
import { Chip } from "./ui";

function umschalten<T>(liste: T[], wert: T): T[] {
  return liste.includes(wert) ? liste.filter((x) => x !== wert) : [...liste, wert];
}

export default function FilterPanel() {
  const { filter, setFilter, fehlendesMaterial, materialUmschalten } = useSpeicher();
  const [materialOffen, setMaterialOffen] = useState(fehlendesMaterial.size > 0);

  const setze = <K extends keyof Filter>(k: K, v: Filter[K]) =>
    setFilter((alt) => ({ ...alt, [k]: v }));

  return (
    <div className="space-y-6">
      <Gruppe titel="Altersklasse">
        {ALTERSKLASSEN.map((a) => (
          <Chip
            key={a.wert}
            aktiv={filter.altersklassen.includes(a.wert)}
            onClick={() => setze("altersklassen", umschalten(filter.altersklassen, a.wert))}
          >
            {a.label}
          </Chip>
        ))}
      </Gruppe>

      <Gruppe titel="Ort">
        {ORTE.map((o) => (
          <Chip
            key={o.wert}
            aktiv={filter.orte.includes(o.wert)}
            onClick={() => setze("orte", umschalten(filter.orte, o.wert))}
          >
            {o.label}
          </Chip>
        ))}
      </Gruppe>

      <Gruppe titel="Form">
        {FORMEN.map((f) => (
          <Chip
            key={f.wert}
            aktiv={filter.formen.includes(f.wert)}
            onClick={() => setze("formen", umschalten(filter.formen, f.wert))}
          >
            {f.label}
          </Chip>
        ))}
      </Gruppe>

      <Gruppe titel="Dauer">
        {DAUERN.map((d) => (
          <Chip
            key={d.wert}
            aktiv={filter.dauern.includes(d.wert)}
            onClick={() => setze("dauern", umschalten(filter.dauern, d.wert))}
          >
            {d.label}
          </Chip>
        ))}
      </Gruppe>

      <Gruppe titel="Sonstiges">
        <Chip aktiv={filter.ohneMaterial} onClick={() => setze("ohneMaterial", !filter.ohneMaterial)}>
          Ohne Material
        </Chip>
        <Chip aktiv={filter.nurFavoriten} onClick={() => setze("nurFavoriten", !filter.nurFavoriten)}>
          <Heart className="h-3.5 w-3.5" />
          Nur Favoriten
        </Chip>
      </Gruppe>

      <div>
        <button
          type="button"
          onClick={() => setMaterialOffen((o) => !o)}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          <span>
            Vorhandenes Material
            {fehlendesMaterial.size > 0 && (
              <span className="ml-1.5 normal-case tracking-normal text-amber-700">
                ({fehlendesMaterial.size} fehlt)
              </span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${materialOffen ? "rotate-180" : ""}`} />
        </button>
        {materialOffen && (
          <div className="mt-2.5">
            <p className="mb-2 text-xs leading-relaxed text-slate-500">
              Haken entfernen, wenn etwas fehlt – Übungen, die es brauchen, werden ausgeblendet. Die
              Auswahl bleibt gespeichert.
            </p>
            <ul className="space-y-1">
              {ALLE_MATERIALIEN.map((m) => (
                <li key={m}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={!fehlendesMaterial.has(m)}
                      onChange={() => materialUmschalten(m)}
                      className="h-4 w-4 rounded border-slate-300 accent-sky-700"
                    />
                    <span className={fehlendesMaterial.has(m) ? "text-slate-400 line-through" : ""}>{m}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Gruppe({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{titel}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
