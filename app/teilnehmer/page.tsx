"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Cake, Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import type { Teilnehmer } from "@/lib/types";
import { alterHeute, datumKurz, tageBisGeburtstag } from "@/lib/labels";
import { useDaten } from "@/lib/store";
import TeilnehmerFormular from "@/components/TeilnehmerFormular";
import {
  Badge,
  LeererHinweis,
  SeitenKopf,
  eingabeKlasse,
  karteKlasse,
  primaerKnopf,
} from "@/components/ui";

export default function TeilnehmerSeite() {
  const { daten, bereit, teilnehmerLoeschen } = useDaten();
  const [suche, setSuche] = useState("");
  const [gruppenFilter, setGruppenFilter] = useState("alle");
  const [bearbeiten, setBearbeiten] = useState<Teilnehmer | "neu" | null>(null);

  const gruppen = useMemo(
    () =>
      [...new Set(daten.teilnehmer.map((t) => t.gruppe).filter((g): g is string => !!g))].sort(
        (a, b) => a.localeCompare(b, "de")
      ),
    [daten.teilnehmer]
  );

  const gefiltert = useMemo(() => {
    const s = suche.trim().toLowerCase();
    return daten.teilnehmer
      .filter((t) => (gruppenFilter === "alle" ? true : t.gruppe === gruppenFilter))
      .filter((t) => !s || t.name.toLowerCase().includes(s))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [daten.teilnehmer, suche, gruppenFilter]);

  if (!bereit) return null;

  return (
    <div>
      <SeitenKopf
        titel="Teilnehmer"
        beschreibung={`${daten.teilnehmer.length} Kinder – mit Leistungsverlauf, Geburtstagen und Sportabzeichen`}
        aktionen={
          <button type="button" onClick={() => setBearbeiten("neu")} className={primaerKnopf}>
            <Plus size={15} />
            Teilnehmer anlegen
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Name suchen …"
            className={`${eingabeKlasse} w-full pl-8`}
          />
        </div>
        {gruppen.length > 0 && (
          <select
            value={gruppenFilter}
            onChange={(e) => setGruppenFilter(e.target.value)}
            className={eingabeKlasse}
          >
            <option value="alle">Alle Gruppen</option>
            {gruppen.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
      </div>

      {gefiltert.length === 0 ? (
        <div className="mt-4">
          <LeererHinweis
            titel={daten.teilnehmer.length === 0 ? "Noch keine Teilnehmer" : "Keine Treffer"}
            text={
              daten.teilnehmer.length === 0
                ? "Lege deine Trainingskinder an – mit Geburtsdatum und Geschlecht sind sie direkt fürs Sportabzeichen vorbereitet."
                : "Passe Suche oder Gruppenfilter an."
            }
          >
            {daten.teilnehmer.length === 0 && (
              <button
                type="button"
                onClick={() => setBearbeiten("neu")}
                className={primaerKnopf}
              >
                <Plus size={15} />
                Ersten Teilnehmer anlegen
              </button>
            )}
          </LeererHinweis>
        </div>
      ) : (
        <div className={`${karteKlasse} mt-4 overflow-x-auto`}>
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">Geburtsdatum</th>
                <th className="px-3 py-2.5 font-medium">Alter</th>
                <th className="px-3 py-2.5 font-medium">Gruppe</th>
                <th className="px-3 py-2.5 font-medium">Leistungen</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {gefiltert.map((t) => {
                const alter = alterHeute(t.geburtsdatum);
                const geburtstagIn = tageBisGeburtstag(t.geburtsdatum);
                const anzahlLeistungen = daten.leistungen.filter(
                  (l) => l.teilnehmerId === t.id
                ).length;
                return (
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/teilnehmer/profil?id=${t.id}`}
                        className="flex items-center gap-2 font-medium text-slate-900 hover:text-sky-800"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <UserRound size={14} />
                        </span>
                        {t.name}
                        {t.geschlecht && (
                          <span className="text-xs font-normal text-slate-400">
                            ({t.geschlecht === "m" ? "Junge" : "Mädchen"})
                          </span>
                        )}
                        {geburtstagIn !== null && geburtstagIn <= 14 && (
                          <Badge className="border-pink-200 bg-pink-50 text-pink-800">
                            <Cake size={11} />
                            {geburtstagIn === 0 ? "heute!" : `in ${geburtstagIn} Tagen`}
                          </Badge>
                        )}
                      </Link>
                    </td>
                    <td className="tabular px-3 py-2.5 text-slate-600">
                      {t.geburtsdatum ? datumKurz(t.geburtsdatum) : "–"}
                    </td>
                    <td className="tabular px-3 py-2.5 text-slate-600">
                      {alter !== null ? `${alter} J.` : "–"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{t.gruppe ?? "–"}</td>
                    <td className="tabular px-3 py-2.5 text-slate-600">{anzahlLeistungen}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setBearbeiten(t)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Bearbeiten"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `„${t.name}" löschen? Auch Leistungen und Sportabzeichen-Ergebnisse werden entfernt.`
                              )
                            ) {
                              teilnehmerLoeschen(t.id);
                            }
                          }}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {bearbeiten && (
        <TeilnehmerFormular
          teilnehmer={bearbeiten === "neu" ? null : bearbeiten}
          onSchliessen={() => setBearbeiten(null)}
        />
      )}
    </div>
  );
}
