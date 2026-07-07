"use client";

import { BookmarkPlus, Check, Clock, Image as ImageIcon, MapPin, Users } from "lucide-react";
import type { Uebung } from "@/lib/types";
import {
  altersText,
  anlageLabel,
  datumKurz,
  disziplinLabel,
  ortLabel,
} from "@/lib/labels";
import { einsaetzeFuerUebung, medienFuerUebung, useDaten } from "@/lib/store";
import { MediumMiniatur } from "./MedienGalerie";
import { AbschnittBadge, Badge, FavoritStern, MaterialBadges } from "./ui";

export default function UebungCard({
  uebung,
  onOeffnen,
}: {
  uebung: Uebung;
  onOeffnen: () => void;
}) {
  const { daten, favoritUmschalten, entwurfUmschalten, entwurf } = useDaten();
  const gemerkt = entwurf.includes(uebung.id);
  const letzterEinsatz = einsaetzeFuerUebung(daten.trainings, uebung.id)[0];
  const vorschau = medienFuerUebung(daten.medien, uebung.id)[0];

  return (
    <article
      onClick={onOeffnen}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:border-slate-300 hover:shadow-md"
    >
      {/* Vorschaubild */}
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-slate-100 bg-slate-100">
        {vorschau ? (
          <MediumMiniatur medium={vorschau} />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <ImageIcon size={28} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <AbschnittBadge abschnitt={uebung.abschnitt} />
        </div>
        <div className="absolute right-1 top-1 rounded-md bg-white/85 backdrop-blur-sm">
          <FavoritStern aktiv={uebung.favorit} onClick={() => favoritUmschalten(uebung.id)} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div>
          <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-sky-800">
            {uebung.titel}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
            {uebung.beschreibung}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} className="text-slate-400" />
            {ortLabel(uebung.ort)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={12} className="text-slate-400" />
            {altersText(uebung.altersVon, uebung.altersBis)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} className="text-slate-400" />
            {uebung.dauer} Min.
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {uebung.disziplinen.map((d) => (
            <Badge key={d} className="border-sky-200 bg-sky-50 text-sky-800">
              {disziplinLabel(d)}
            </Badge>
          ))}
          <MaterialBadges material={uebung.material} />
          {uebung.anlagen.map((a) => (
            <Badge key={a} className="border-orange-200 bg-orange-50 text-orange-800">
              braucht {anlageLabel(a)}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2.5">
          <span className="text-xs text-slate-400">
            {letzterEinsatz
              ? `Zuletzt ${datumKurz(letzterEinsatz.training.datum)}`
              : "Noch nie eingesetzt"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              entwurfUmschalten(uebung.id);
            }}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              gemerkt
                ? "bg-sky-50 text-sky-800"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            {gemerkt ? <Check size={13} /> : <BookmarkPlus size={13} />}
            {gemerkt ? "Gemerkt" : "Merken"}
          </button>
        </div>
      </div>
    </article>
  );
}
