"use client";

import { useState } from "react";
import { Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { Checkliste } from "@/lib/types";
import { neueId, useDaten } from "@/lib/store";
import {
  LeererHinweis,
  SeitenKopf,
  eingabeKlasse,
  karteKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

const VORLAGE_TRAINING = [
  "Hütchen einpacken",
  "Leibchen einpacken",
  "Erste-Hilfe-Tasche",
  "Trinkflasche",
  "Anwesenheitsliste",
  "Handy geladen (Notfallnummern)",
];

export default function ChecklistenSeite() {
  const { daten, bereit, checklisteSpeichern, checklisteLoeschen } = useDaten();
  const [neuTitel, setNeuTitel] = useState("");

  if (!bereit) return null;

  const listen = [...daten.checklisten].sort((a, b) =>
    b.erstelltAm.localeCompare(a.erstelltAm)
  );

  function anlegen(titel: string, punkte: string[] = []) {
    const sauber = titel.trim();
    if (!sauber) return;
    checklisteSpeichern({
      id: neueId(),
      titel: sauber,
      punkte: punkte.map((text) => ({ id: neueId(), text, erledigt: false })),
      erstelltAm: new Date().toISOString(),
    });
    setNeuTitel("");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SeitenKopf
        titel="Checklisten"
        beschreibung="Material und Aufgaben abhaken – vor dem Training, vor dem Sportfest, vor dem Wettkampf."
      />

      <div className={`${karteKlasse} flex flex-wrap items-center gap-2 p-4`}>
        <input
          value={neuTitel}
          onChange={(e) => setNeuTitel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") anlegen(neuTitel);
          }}
          placeholder="Neue Checkliste, z. B. „Sportfest Juli“ …"
          className={`${eingabeKlasse} min-w-48 flex-1`}
        />
        <button type="button" onClick={() => anlegen(neuTitel)} className={primaerKnopf}>
          <Plus size={15} />
          Anlegen
        </button>
        <button
          type="button"
          onClick={() => anlegen("Trainings-Packliste", VORLAGE_TRAINING)}
          className={sekundaerKnopf}
          title="Startet mit typischen Punkten fürs Kindertraining"
        >
          Vorlage: Training
        </button>
      </div>

      {listen.length === 0 ? (
        <div className="mt-4">
          <LeererHinweis
            titel="Noch keine Checkliste"
            text="Leg oben eine an – zum Beispiel die Packliste fürs nächste Training."
          />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {listen.map((liste) => (
            <ChecklistenKarte key={liste.id} liste={liste} />
          ))}
        </div>
      )}
    </div>
  );

  function ChecklistenKarte({ liste }: { liste: Checkliste }) {
    const [neuerPunkt, setNeuerPunkt] = useState("");
    const erledigt = liste.punkte.filter((p) => p.erledigt).length;

    function punktHinzufuegen() {
      const text = neuerPunkt.trim();
      if (!text) return;
      checklisteSpeichern({
        ...liste,
        punkte: [...liste.punkte, { id: neueId(), text, erledigt: false }],
      });
      setNeuerPunkt("");
    }

    return (
      <div className={`${karteKlasse} p-4`}>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-slate-900">{liste.titel}</h2>
          <span className="tabular text-xs text-slate-400">
            {erledigt}/{liste.punkte.length}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() =>
              checklisteSpeichern({
                ...liste,
                punkte: liste.punkte.map((p) => ({ ...p, erledigt: false })),
              })
            }
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Alle Haken entfernen"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={() =>
              checklisteSpeichern({
                ...liste,
                id: neueId(),
                titel: `${liste.titel} (Kopie)`,
                punkte: liste.punkte.map((p) => ({ ...p, id: neueId(), erledigt: false })),
                erstelltAm: new Date().toISOString(),
              })
            }
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Duplizieren"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`„${liste.titel}" löschen?`)) checklisteLoeschen(liste.id);
            }}
            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Löschen"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Fortschritt */}
        {liste.punkte.length > 0 && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(erledigt / liste.punkte.length) * 100}%` }}
            />
          </div>
        )}

        <ul className="mt-2 divide-y divide-slate-100">
          {liste.punkte.map((p) => (
            <li key={p.id} className="group flex items-center gap-2.5 py-1.5">
              <label className="flex flex-1 cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={p.erledigt}
                  onChange={(e) =>
                    checklisteSpeichern({
                      ...liste,
                      punkte: liste.punkte.map((x) =>
                        x.id === p.id ? { ...x, erledigt: e.target.checked } : x
                      ),
                    })
                  }
                  className="h-4 w-4 accent-emerald-600"
                />
                <span
                  className={`text-sm ${
                    p.erledigt ? "text-slate-400 line-through" : "text-slate-800"
                  }`}
                >
                  {p.text}
                </span>
              </label>
              <button
                type="button"
                onClick={() =>
                  checklisteSpeichern({
                    ...liste,
                    punkte: liste.punkte.filter((x) => x.id !== p.id),
                  })
                }
                className="rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                title="Punkt entfernen"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex gap-2">
          <input
            value={neuerPunkt}
            onChange={(e) => setNeuerPunkt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") punktHinzufuegen();
            }}
            placeholder="Punkt hinzufügen …"
            className={`${eingabeKlasse} flex-1 py-1.5`}
          />
          <button type="button" onClick={punktHinzufuegen} className={sekundaerKnopf}>
            <Plus size={15} />
          </button>
        </div>
      </div>
    );
  }
}
