"use client";

import Link from "next/link";
import { CalendarPlus, ThumbsUp } from "lucide-react";
import type { Training } from "@/lib/types";
import { datumFormat, disziplinLabel, heuteISO, ortLabel } from "@/lib/labels";
import { useDaten } from "@/lib/store";
import { Badge, LeererHinweis, SeitenKopf, primaerKnopf } from "@/components/ui";

export default function TrainingsSeite() {
  const { daten, bereit } = useDaten();
  if (!bereit) return null;

  const geplant = daten.trainings
    .filter((t) => t.status === "geplant")
    .sort((a, b) => a.datum.localeCompare(b.datum));
  const abgeschlossen = daten.trainings
    .filter((t) => t.status === "abgeschlossen")
    .sort((a, b) => b.datum.localeCompare(a.datum));

  return (
    <div>
      <SeitenKopf
        titel="Meine Trainings"
        beschreibung="Geplante Einheiten und dein Trainingslog – zum Nachschlagen, was wann gut lief."
        aktionen={
          <Link href="/planen" className={primaerKnopf}>
            <CalendarPlus size={15} />
            Training planen
          </Link>
        }
      />

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Geplant
        </h2>
        {geplant.length === 0 ? (
          <LeererHinweis
            titel="Kein Training geplant"
            text="Stell dir aus der Übungsdatenbank ein Training zusammen – es taucht dann hier auf."
          >
            <Link href="/planen" className={primaerKnopf}>
              Jetzt planen
            </Link>
          </LeererHinweis>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {geplant.map((t) => (
              <TrainingKarte key={t.id} training={t} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Trainingslog ({abgeschlossen.length})
        </h2>
        {abgeschlossen.length === 0 ? (
          <LeererHinweis
            titel="Noch nichts im Log"
            text="Nach einer Einheit schließt du das Training ab und hältst fest, was gut lief – so baust du dir dein persönliches Archiv auf."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {abgeschlossen.map((t) => (
              <TrainingKarte key={t.id} training={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TrainingKarte({ training }: { training: Training }) {
  const ueberfaellig = training.status === "geplant" && training.datum < heuteISO();

  return (
    <Link
      href={`/trainings/ansicht?id=${training.id}`}
      className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`tabular text-sm font-medium ${
            training.status === "geplant" ? "text-sky-800" : "text-slate-400"
          }`}
        >
          {datumFormat(training.datum)}
        </span>
        {ueberfaellig && (
          <Badge className="border-amber-200 bg-amber-50 text-amber-800">
            Reflexion offen
          </Badge>
        )}
      </div>
      <h3 className="font-semibold text-slate-900">{training.titel}</h3>
      <p className="text-xs text-slate-500">
        {training.eintraege.length} Übungen
        {training.gruppe ? ` · ${training.gruppe}` : ""}
        {training.ort ? ` · ${ortLabel(training.ort)}` : ""}
        {training.schwerpunkt ? ` · Schwerpunkt ${disziplinLabel(training.schwerpunkt)}` : ""}
      </p>
      {training.status === "abgeschlossen" && training.reflexion?.gut && (
        <p className="mt-1 flex items-start gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-800">
          <ThumbsUp size={12} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{training.reflexion.gut}</span>
        </p>
      )}
    </Link>
  );
}
