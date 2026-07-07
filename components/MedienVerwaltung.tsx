"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Link2, Trash2, Upload } from "lucide-react";
import type { Medium } from "@/lib/types";
import { medienFuerUebung, neueId, useDaten, youtubeId } from "@/lib/store";
import { MediumMiniatur } from "./MedienGalerie";
import { eingabeKlasse, sekundaerKnopf } from "./ui";

/**
 * Medien einer Übung verwalten (im Übungsformular): Bilder/Videos hochladen,
 * YouTube-Links hinzufügen, beschriften, sortieren, löschen.
 */
export default function MedienVerwaltung({
  uebungId,
  onHochgeladen,
}: {
  uebungId: string;
  /** Meldet neu angelegte Medien-IDs (zum Aufräumen bei Abbruch). */
  onHochgeladen?: (mediumId: string) => void;
}) {
  const { daten, mediumHochladen, mediumSpeichern, mediumLoeschen } = useDaten();
  const medien = medienFuerUebung(daten.medien, uebungId);
  const dateiInput = useRef<HTMLInputElement>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function dateienHochladen(dateien: FileList) {
    setLaedt(true);
    setFehler(null);
    let reihenfolge = medien.length;
    for (const datei of Array.from(dateien)) {
      const medium = await mediumHochladen(uebungId, datei, reihenfolge++);
      if (medium) {
        onHochgeladen?.(medium.id);
      } else {
        setFehler(`„${datei.name}" konnte nicht hochgeladen werden.`);
      }
    }
    setLaedt(false);
  }

  function youtubeHinzufuegen() {
    const url = youtubeUrl.trim();
    if (!url) return;
    if (!youtubeId(url)) {
      setFehler("Das sieht nicht nach einem YouTube-Link aus.");
      return;
    }
    setFehler(null);
    const medium: Medium = {
      id: neueId(),
      uebungId,
      typ: "youtube",
      url,
      reihenfolge: medien.length,
    };
    mediumSpeichern(medium);
    onHochgeladen?.(medium.id);
    setYoutubeUrl("");
  }

  function verschieben(index: number, richtung: -1 | 1) {
    const ziel = index + richtung;
    if (ziel < 0 || ziel >= medien.length) return;
    const kopie = [...medien];
    [kopie[index], kopie[ziel]] = [kopie[ziel], kopie[index]];
    kopie.forEach((m, i) => mediumSpeichern({ ...m, reihenfolge: i }));
  }

  return (
    <div>
      <p className="text-xs font-medium text-slate-600">
        Bilder & Videos (optional) – das erste Medium wird als Vorschaubild genutzt
      </p>

      {medien.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {medien.map((m, i) => (
            <li
              key={m.id}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2"
            >
              <span className="h-12 w-16 shrink-0 overflow-hidden rounded border border-slate-200 bg-white">
                <MediumMiniatur medium={m} />
              </span>
              <span className="w-14 shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {m.typ}
              </span>
              <input
                value={m.beschriftung ?? ""}
                onChange={(e) =>
                  mediumSpeichern({ ...m, beschriftung: e.target.value || undefined })
                }
                placeholder="Beschriftung (optional)"
                className={`${eingabeKlasse} min-w-0 flex-1 py-1`}
              />
              <button
                type="button"
                onClick={() => verschieben(i, -1)}
                disabled={i === 0}
                className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-25"
                title="Nach vorne"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                onClick={() => verschieben(i, 1)}
                disabled={i === medien.length - 1}
                className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-25"
                title="Nach hinten"
              >
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                onClick={() => mediumLoeschen(m.id)}
                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                title="Entfernen"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => dateiInput.current?.click()}
          disabled={laedt}
          className={sekundaerKnopf}
        >
          <Upload size={15} />
          {laedt ? "Lädt hoch …" : "Bilder/Videos hochladen"}
        </button>
        <input
          ref={dateiInput}
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void dateienHochladen(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex min-w-52 flex-1 items-center gap-1.5">
          <Link2 size={16} className="shrink-0 text-slate-400" />
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                youtubeHinzufuegen();
              }
            }}
            placeholder="YouTube-Link einfügen …"
            className={`${eingabeKlasse} min-w-0 flex-1 py-1.5`}
          />
          <button type="button" onClick={youtubeHinzufuegen} className={sekundaerKnopf}>
            Hinzufügen
          </button>
        </div>
      </div>
      {fehler && <p className="mt-1.5 text-xs font-medium text-red-600">{fehler}</p>}
    </div>
  );
}
