"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, Play, Plus, RotateCcw, Save, Square, Timer, Trash2, X } from "lucide-react";
import type { StoppuhrErgebnis } from "@/lib/types";
import { datumFormat, heuteISO, msFormat } from "@/lib/labels";
import { neueId, useDaten } from "@/lib/store";
import {
  Badge,
  Feld,
  LeererHinweis,
  SeitenKopf,
  eingabeKlasse,
  karteKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

type Phase = "aufbau" | "laeuft" | "fertig";

interface Laeufer {
  name: string;
  teilnehmerId?: string;
  runden: number[];
  endzeit: number | null;
}

export default function StoppuhrSeite() {
  const { daten, bereit, stoppuhrSessionSpeichern, stoppuhrSessionLoeschen, leistungSpeichern } =
    useDaten();
  const [phase, setPhase] = useState<Phase>("aufbau");
  const [bezeichnung, setBezeichnung] = useState("");
  const [laeufer, setLaeufer] = useState<Laeufer[]>([]);
  const [nameEingabe, setNameEingabe] = useState("");
  const [startZeit, setStartZeit] = useState(0);
  const [jetzt, setJetzt] = useState(0);
  const [gespeichert, setGespeichert] = useState(false);
  const intervall = useRef<ReturnType<typeof setInterval> | null>(null);

  // Laufende Uhr (50ms reichen fürs Auge; gestoppt wird exakt per Date.now()).
  useEffect(() => {
    if (phase === "laeuft") {
      intervall.current = setInterval(() => setJetzt(Date.now()), 50);
      return () => {
        if (intervall.current) clearInterval(intervall.current);
      };
    }
  }, [phase]);

  const vergangen = phase === "aufbau" ? 0 : Math.max(0, jetzt - startZeit);

  const sessions = useMemo(
    () =>
      [...daten.stoppuhrSessions].sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, 10),
    [daten.stoppuhrSessions]
  );

  if (!bereit) return null;

  function laeuferHinzufuegen(name: string, teilnehmerId?: string) {
    const sauber = name.trim();
    if (!sauber || laeufer.some((l) => l.name === sauber)) return;
    setLaeufer([...laeufer, { name: sauber, teilnehmerId, runden: [], endzeit: null }]);
    setNameEingabe("");
  }

  function starten() {
    if (laeufer.length === 0) return;
    const t = Date.now();
    setStartZeit(t);
    setJetzt(t);
    setGespeichert(false);
    setLaeufer((alt) => alt.map((l) => ({ ...l, runden: [], endzeit: null })));
    setPhase("laeuft");
  }

  function runde(index: number) {
    const zeit = Date.now() - startZeit;
    setLaeufer((alt) =>
      alt.map((l, i) => (i === index ? { ...l, runden: [...l.runden, zeit] } : l))
    );
  }

  function ziel(index: number) {
    const zeit = Date.now() - startZeit;
    setLaeufer((alt) => {
      const neu = alt.map((l, i) => (i === index ? { ...l, endzeit: zeit } : l));
      if (neu.every((l) => l.endzeit !== null)) setPhase("fertig");
      return neu;
    });
  }

  function alleStoppen() {
    const zeit = Date.now() - startZeit;
    setLaeufer((alt) => alt.map((l) => (l.endzeit === null ? { ...l, endzeit: zeit } : l)));
    setPhase("fertig");
  }

  function sessionSpeichern(alsLeistung: boolean) {
    const ergebnisse: StoppuhrErgebnis[] = laeufer.map((l) => ({
      name: l.name,
      teilnehmerId: l.teilnehmerId,
      runden: l.runden,
      endzeit: l.endzeit,
    }));
    stoppuhrSessionSpeichern({
      id: neueId(),
      datum: new Date().toISOString(),
      bezeichnung: bezeichnung.trim() || `Lauf am ${heuteISO().split("-").reverse().join(".")}`,
      ergebnisse,
    });
    if (alsLeistung) {
      const disziplin = bezeichnung.trim() || "Lauf (Stoppuhr)";
      for (const l of laeufer) {
        if (l.teilnehmerId && l.endzeit !== null) {
          leistungSpeichern({
            id: neueId(),
            teilnehmerId: l.teilnehmerId,
            disziplin,
            wert: Math.round(l.endzeit / 10) / 100,
            einheit: "min",
            datum: heuteISO(),
            quelle: "stoppuhr",
          });
        }
      }
    }
    setGespeichert(true);
  }

  function zuruecksetzen() {
    setPhase("aufbau");
    setGespeichert(false);
    setLaeufer((alt) => alt.map((l) => ({ ...l, runden: [], endzeit: null })));
  }

  const mitTeilnehmer = laeufer.some((l) => l.teilnehmerId);

  return (
    <div className="mx-auto max-w-3xl">
      <SeitenKopf
        titel="Stoppuhr"
        beschreibung="Eine Uhr für alle: Tippe auf ein Kind, um seine Runde oder Zielzeit zu stoppen – die Uhr läuft für die anderen weiter."
      />

      {/* Aufbau */}
      {phase === "aufbau" && (
        <div className={`${karteKlasse} p-4`}>
          <Feld label="Bezeichnung (wird als Disziplin gespeichert)">
            <input
              value={bezeichnung}
              onChange={(e) => setBezeichnung(e.target.value)}
              placeholder="z. B. 800m Lauf"
              className={eingabeKlasse}
            />
          </Feld>

          <p className="mt-3 text-xs font-medium text-slate-600">Läufer</p>
          {laeufer.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {laeufer.map((l, i) => (
                <button
                  key={l.name}
                  type="button"
                  onClick={() => setLaeufer(laeufer.filter((_, j) => j !== i))}
                  title="Entfernen"
                >
                  <Badge className="border-sky-200 bg-sky-50 text-sky-800">
                    {l.name} <X size={11} />
                  </Badge>
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <input
              value={nameEingabe}
              onChange={(e) => setNameEingabe(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  laeuferHinzufuegen(nameEingabe);
                }
              }}
              placeholder="Name eintippen und Enter …"
              className={`${eingabeKlasse} flex-1`}
            />
            <button
              type="button"
              onClick={() => laeuferHinzufuegen(nameEingabe)}
              className={sekundaerKnopf}
            >
              <Plus size={15} />
            </button>
          </div>

          {daten.teilnehmer.length > 0 && (
            <>
              <p className="mt-3 text-xs text-slate-400">
                Oder aus den Teilnehmern wählen (Zeiten lassen sich dann ins Profil
                übernehmen):
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {daten.teilnehmer
                  .filter((t) => !laeufer.some((l) => l.teilnehmerId === t.id))
                  .sort((a, b) => a.name.localeCompare(b.name, "de"))
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => laeuferHinzufuegen(t.name, t.id)}
                    >
                      <Badge className="border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-800">
                        + {t.name}
                      </Badge>
                    </button>
                  ))}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={starten}
            disabled={laeufer.length === 0}
            className={`${primaerKnopf} mt-4 w-full py-3 text-base`}
          >
            <Play size={18} />
            Start
          </button>
        </div>
      )}

      {/* Läuft / Fertig */}
      {phase !== "aufbau" && (
        <div className={`${karteKlasse} p-4`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              {bezeichnung || "Lauf"} · {laeufer.filter((l) => l.endzeit !== null).length}/
              {laeufer.length} im Ziel
            </p>
            <p className="tabular text-4xl font-semibold tracking-tight text-slate-900">
              <Timer size={22} className="mr-1.5 inline text-sky-700" />
              {msFormat(vergangen)}
            </p>
          </div>

          <ul className="mt-4 space-y-2">
            {laeufer.map((l, i) => (
              <li
                key={l.name}
                className={`flex flex-wrap items-center gap-2 rounded-md border px-3 py-2.5 ${
                  l.endzeit !== null
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="min-w-28 flex-1 font-medium text-slate-900">{l.name}</span>
                {l.runden.length > 0 && (
                  <span className="tabular text-xs text-slate-500">
                    {l.runden.map((r, j) => (
                      <span key={j} className="mr-2">
                        R{j + 1}: {msFormat(r)}
                      </span>
                    ))}
                  </span>
                )}
                {l.endzeit !== null ? (
                  <span className="tabular text-lg font-semibold text-emerald-700">
                    {msFormat(l.endzeit)}
                  </span>
                ) : phase === "laeuft" ? (
                  <span className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => runde(i)}
                      className={`${sekundaerKnopf} px-3 py-2`}
                    >
                      <Flag size={15} />
                      Runde
                    </button>
                    <button
                      type="button"
                      onClick={() => ziel(i)}
                      className={`${primaerKnopf} px-4 py-2`}
                    >
                      <Square size={14} />
                      Ziel
                    </button>
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">nicht im Ziel</span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            {phase === "laeuft" && (
              <button type="button" onClick={alleStoppen} className={sekundaerKnopf}>
                <Square size={14} />
                Alle stoppen
              </button>
            )}
            {phase === "fertig" && !gespeichert && (
              <>
                <button
                  type="button"
                  onClick={() => sessionSpeichern(mitTeilnehmer)}
                  className={primaerKnopf}
                >
                  <Save size={15} />
                  Speichern{mitTeilnehmer ? " + Zeiten in Profile" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => sessionSpeichern(false)}
                  className={sekundaerKnopf}
                >
                  Nur Session speichern
                </button>
              </>
            )}
            {phase === "fertig" && gespeichert && (
              <p className="flex items-center text-sm font-medium text-emerald-700">
                Gespeichert.
              </p>
            )}
            <button type="button" onClick={zuruecksetzen} className={`${sekundaerKnopf} ml-auto`}>
              <RotateCcw size={14} />
              Neuer Lauf
            </button>
          </div>
        </div>
      )}

      {/* Vergangene Sessions */}
      <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Letzte Läufe
      </h2>
      {sessions.length === 0 ? (
        <LeererHinweis
          titel="Noch keine gespeicherten Läufe"
          text="Gestoppte Läufe landen hier – und auf Wunsch als Leistung im Teilnehmerprofil."
        />
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className={`${karteKlasse} px-4 py-3`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-slate-900">{s.bezeichnung}</p>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{datumFormat(s.datum)}</span>
                  <button
                    type="button"
                    onClick={() => stoppuhrSessionLoeschen(s.id)}
                    className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600"
                    title="Löschen"
                  >
                    <Trash2 size={13} />
                  </button>
                </span>
              </div>
              <p className="tabular mt-1 text-sm text-slate-600">
                {[...s.ergebnisse]
                  .sort((a, b) => (a.endzeit ?? Infinity) - (b.endzeit ?? Infinity))
                  .map((e) => `${e.name} ${e.endzeit !== null ? msFormat(e.endzeit) : "–"}`)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
