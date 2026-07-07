"use client";

import Link from "next/link";
import { BookmarkPlus, Check, Pencil, Trash2 } from "lucide-react";
import {
  altersText,
  anlageLabel,
  datumFormat,
  disziplinLabel,
  gruppenText,
  ortLabel,
} from "@/lib/labels";
import { einsaetzeFuerUebung, medienFuerUebung, useDaten } from "@/lib/store";
import MedienGalerie from "./MedienGalerie";
import {
  AbschnittBadge,
  Badge,
  BewertungsSymbol,
  Dialog,
  FavoritStern,
  MaterialBadges,
  gefahrKnopf,
  primaerKnopf,
  sekundaerKnopf,
} from "./ui";

export default function UebungDetail({
  uebungId,
  onSchliessen,
}: {
  uebungId: string;
  onSchliessen: () => void;
}) {
  const { daten, favoritUmschalten, entwurfUmschalten, entwurf, uebungLoeschen } = useDaten();
  const uebung = daten.uebungen.find((u) => u.id === uebungId);
  if (!uebung) return null;

  const gemerkt = entwurf.includes(uebung.id);
  const einsaetze = einsaetzeFuerUebung(daten.trainings, uebung.id);
  const medien = medienFuerUebung(daten.medien, uebung.id);

  function loeschen() {
    if (!uebung) return;
    const frage =
      einsaetze.length > 0
        ? `„${uebung.titel}" wirklich löschen? Die Übung steckt in ${einsaetze.length} Training(s) und wird dort als „gelöschte Übung" angezeigt.`
        : `„${uebung.titel}" wirklich löschen?`;
    if (window.confirm(frage)) {
      uebungLoeschen(uebung.id);
      onSchliessen();
    }
  }

  return (
    <Dialog offen onSchliessen={onSchliessen} breite="max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <AbschnittBadge abschnitt={uebung.abschnitt} />
            {uebung.disziplinen.map((d) => (
              <Badge key={d} className="border-sky-200 bg-sky-50 text-sky-800">
                {disziplinLabel(d)}
              </Badge>
            ))}
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            {uebung.titel}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {ortLabel(uebung.ort)} · {altersText(uebung.altersVon, uebung.altersBis)} ·{" "}
            {gruppenText(uebung.gruppeMin, uebung.gruppeMax)} · ca. {uebung.dauer} Min.
          </p>
        </div>
        <FavoritStern aktiv={uebung.favorit} onClick={() => favoritUmschalten(uebung.id)} />
      </div>

      {medien.length > 0 && (
        <div className="mt-4">
          <MedienGalerie medien={medien} />
        </div>
      )}

      <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
        {uebung.beschreibung}
      </p>

      {uebung.variationen && (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Variationen
          </p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {uebung.variationen}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1">
        <MaterialBadges material={uebung.material} />
        {uebung.anlagen.map((a) => (
          <Badge key={a} className="border-orange-200 bg-orange-50 text-orange-800">
            braucht {anlageLabel(a)}
          </Badge>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-slate-200 p-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Einsatz-Historie
        </p>
        {einsaetze.length === 0 ? (
          <p className="mt-1 text-sm text-slate-400">Diese Übung war noch in keinem Training.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {einsaetze.map(({ training, eintrag }, i) => (
              <li key={training.id + i} className="flex items-baseline gap-2 text-sm">
                <BewertungsSymbol bewertung={eintrag.bewertung} />
                <span className="tabular whitespace-nowrap text-slate-500">
                  {datumFormat(training.datum)}
                </span>
                <Link
                  href={`/trainings/ansicht?id=${training.id}`}
                  className="font-medium text-sky-800 hover:underline"
                >
                  {training.titel}
                </Link>
                {eintrag.notiz && <span className="text-slate-500">– {eintrag.notiz}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => entwurfUmschalten(uebung.id)}
          className={gemerkt ? sekundaerKnopf : primaerKnopf}
        >
          {gemerkt ? <Check size={15} /> : <BookmarkPlus size={15} />}
          {gemerkt ? "Fürs Training gemerkt" : "Fürs Training merken"}
        </button>
        <Link href={`/uebungen/neu?id=${uebung.id}`} className={sekundaerKnopf}>
          <Pencil size={14} />
          Bearbeiten
        </Link>
        <button type="button" onClick={loeschen} className={gefahrKnopf}>
          <Trash2 size={14} />
          Löschen
        </button>
      </div>
    </Dialog>
  );
}
