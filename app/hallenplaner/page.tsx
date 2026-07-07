"use client";

import { useMemo, useRef, useState } from "react";
import {
  Copy,
  FilePlus2,
  FolderOpen,
  Printer,
  RotateCw,
  Save,
  Settings2,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { PlanElement, PlatzKonfiguration, PlatzTyp, Platzplan } from "@/lib/types";
import { datumKurz, heuteISO } from "@/lib/labels";
import { neueId, useDaten } from "@/lib/store";
import FeldHintergrund, { PLATZ_NAMEN, PLATZ_ORT } from "@/components/planer/Felder";
import { ELEMENT_MAP, MATERIAL_ELEMENTE, PLAN_ELEMENTE } from "@/components/planer/elemente";
import {
  Dialog,
  Feld,
  SeitenKopf,
  eingabeKlasse,
  karteKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

const ALLE_PLAETZE: PlatzTyp[] = ["halle", "tartanplatz", "bahn400"];

const STANDARD_KONFIG: PlatzKonfiguration = {
  konfiguriert: false,
  aktivePlaetze: ALLE_PLAETZE,
  materialDrinnen: MATERIAL_ELEMENTE.map((e) => e.typ),
  materialDraussen: MATERIAL_ELEMENTE.map((e) => e.typ),
};

export default function HallenplanerSeite() {
  const { daten, bereit, einstellungSetzen, platzplanSpeichern, platzplanLoeschen } = useDaten();

  const konfig: PlatzKonfiguration = {
    ...STANDARD_KONFIG,
    ...((daten.einstellungen["plaetze"] as Partial<PlatzKonfiguration>) ?? {}),
  };

  const [setupOffen, setSetupOffen] = useState(false);
  const [ladenOffen, setLadenOffen] = useState(false);

  // Aktueller Plan
  const [planId, setPlanId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [platz, setPlatz] = useState<PlatzTyp>(konfig.aktivePlaetze[0] ?? "halle");
  const [elemente, setElemente] = useState<PlanElement[]>([]);
  const [auswahlId, setAuswahlId] = useState<string | null>(null);
  const [gespeichertUm, setGespeichertUm] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const verfuegbaresMaterial =
    PLATZ_ORT[platz] === "drinnen" ? konfig.materialDrinnen : konfig.materialDraussen;
  const palette = PLAN_ELEMENTE.filter(
    (e) => !e.material || verfuegbaresMaterial.includes(e.typ)
  );

  const auswahl = elemente.find((e) => e.id === auswahlId) ?? null;

  const plaene = useMemo(
    () => [...daten.platzplaene].sort((a, b) => b.geaendertAm.localeCompare(a.geaendertAm)),
    [daten.platzplaene]
  );

  if (!bereit) return null;

  const brauchtSetup = !konfig.konfiguriert && !setupOffen;

  // ===== Koordinaten & Interaktion =====

  function svgPunkt(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1000,
      y: ((e.clientY - rect.top) / rect.height) * 600,
    };
  }

  function elementHinzufuegen(typ: string) {
    const neu: PlanElement = {
      id: neueId(),
      typ,
      x: 460 + Math.random() * 80,
      y: 260 + Math.random() * 80,
      rotation: 0,
      skalierung: 1,
      beschriftung: typ === "text" ? "Text" : undefined,
    };
    setElemente((alt) => [...alt, neu]);
    setAuswahlId(neu.id);
  }

  function elementAendern(id: string, aenderung: Partial<PlanElement>) {
    setElemente((alt) => alt.map((e) => (e.id === id ? { ...e, ...aenderung } : e)));
  }

  function speichern() {
    const jetzt = new Date().toISOString();
    const id = planId ?? neueId();
    const plan: Platzplan = {
      id,
      name:
        name.trim() ||
        `${PLATZ_NAMEN[platz]} – ${heuteISO().split("-").reverse().join(".")}`,
      platz,
      elemente,
      erstelltAm:
        daten.platzplaene.find((p) => p.id === id)?.erstelltAm ?? jetzt,
      geaendertAm: jetzt,
    };
    platzplanSpeichern(plan);
    setPlanId(id);
    if (!name.trim()) setName(plan.name);
    setGespeichertUm(new Date().toLocaleTimeString("de-DE"));
  }

  function laden(plan: Platzplan) {
    setPlanId(plan.id);
    setName(plan.name);
    setPlatz(plan.platz);
    setElemente(plan.elemente);
    setAuswahlId(null);
    setGespeichertUm(null);
    setLadenOffen(false);
  }

  function neuerPlan() {
    setPlanId(null);
    setName("");
    setElemente([]);
    setAuswahlId(null);
    setGespeichertUm(null);
  }

  return (
    <div>
      <div className="print-verbergen">
        <SeitenKopf
          titel="Hallen- & Platzplaner"
          beschreibung="Aufbauten planen: Feld wählen, Material aus deiner Ausstattung platzieren, speichern und drucken."
          aktionen={
            <button type="button" onClick={() => setSetupOffen(true)} className={sekundaerKnopf}>
              <Settings2 size={15} />
              Meine Anlagen & Material
            </button>
          }
        />

        {/* Werkzeugleiste */}
        <div className={`${karteKlasse} flex flex-wrap items-center gap-2 p-3`}>
          <select
            value={platz}
            onChange={(e) => {
              setPlatz(e.target.value as PlatzTyp);
              setAuswahlId(null);
            }}
            className={eingabeKlasse}
            title="Feld wählen"
          >
            {(konfig.aktivePlaetze.length > 0 ? konfig.aktivePlaetze : ALLE_PLAETZE).map(
              (p) => (
                <option key={p} value={p}>
                  {PLATZ_NAMEN[p]} ({PLATZ_ORT[p] === "drinnen" ? "drinnen" : "draußen"})
                </option>
              )
            )}
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name des Plans, z. B. Stationsbetrieb U10 …"
            className={`${eingabeKlasse} min-w-44 flex-1`}
          />
          <button type="button" onClick={speichern} className={primaerKnopf}>
            <Save size={15} />
            Speichern
          </button>
          <button type="button" onClick={() => setLadenOffen(true)} className={sekundaerKnopf}>
            <FolderOpen size={15} />
            Laden ({plaene.length})
          </button>
          <button type="button" onClick={neuerPlan} className={sekundaerKnopf}>
            <FilePlus2 size={15} />
            Neu
          </button>
          <button type="button" onClick={() => window.print()} className={sekundaerKnopf}>
            <Printer size={15} />
          </button>
          {gespeichertUm && (
            <span className="text-xs text-emerald-700">Gespeichert {gespeichertUm}</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row">
        {/* Palette */}
        <aside className="print-verbergen w-full shrink-0 lg:w-52">
          <div className={`${karteKlasse} p-3`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Material ({PLATZ_ORT[platz] === "drinnen" ? "Halle" : "draußen"})
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-2">
              {palette.map((def) => (
                <button
                  key={def.typ}
                  type="button"
                  onClick={() => elementHinzufuegen(def.typ)}
                  className="flex flex-col items-center gap-0.5 rounded-md border border-slate-200 bg-white p-1.5 transition-colors hover:border-sky-400 hover:bg-sky-50"
                  title={`${def.label} hinzufügen`}
                >
                  <svg viewBox="-55 -32 110 64" className="h-8 w-full">
                    {def.render()}
                  </svg>
                  <span className="w-full truncate text-center text-[10px] font-medium text-slate-600">
                    {def.label}
                  </span>
                </button>
              ))}
            </div>
            {palette.length < PLAN_ELEMENTE.length && (
              <p className="mt-2 text-[11px] text-slate-400">
                Ausgeblendetes Material kannst du unter „Meine Anlagen & Material" aktivieren.
              </p>
            )}
          </div>
        </aside>

        {/* Zeichenfläche */}
        <div className="min-w-0 flex-1">
          {/* Auswahl-Werkzeuge */}
          <div
            className={`print-verbergen mb-2 flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border px-3 py-1.5 ${
              auswahl ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white"
            }`}
          >
            {auswahl ? (
              <>
                <span className="mr-1 text-sm font-medium text-sky-900">
                  {ELEMENT_MAP.get(auswahl.typ)?.label}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    elementAendern(auswahl.id, { rotation: auswahl.rotation - 15 })
                  }
                  className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:text-sky-800"
                  title="15° gegen den Uhrzeigersinn"
                >
                  <RotateCw size={14} className="-scale-x-100" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    elementAendern(auswahl.id, { rotation: auswahl.rotation + 15 })
                  }
                  className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:text-sky-800"
                  title="15° im Uhrzeigersinn"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    elementAendern(auswahl.id, {
                      skalierung: Math.max(0.5, Math.round(auswahl.skalierung / 1.25 * 100) / 100),
                    })
                  }
                  className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:text-sky-800"
                  title="Kleiner"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    elementAendern(auswahl.id, {
                      skalierung: Math.min(3, Math.round(auswahl.skalierung * 1.25 * 100) / 100),
                    })
                  }
                  className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:text-sky-800"
                  title="Größer"
                >
                  <ZoomIn size={14} />
                </button>
                <input
                  value={auswahl.beschriftung ?? ""}
                  onChange={(e) =>
                    elementAendern(auswahl.id, { beschriftung: e.target.value || undefined })
                  }
                  placeholder="Beschriftung …"
                  className={`${eingabeKlasse} w-40 py-1`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const kopie: PlanElement = {
                      ...auswahl,
                      id: neueId(),
                      x: auswahl.x + 25,
                      y: auswahl.y + 25,
                    };
                    setElemente((alt) => [...alt, kopie]);
                    setAuswahlId(kopie.id);
                  }}
                  className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:text-sky-800"
                  title="Duplizieren"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElemente((alt) => alt.filter((e) => e.id !== auswahl.id));
                    setAuswahlId(null);
                  }}
                  className="rounded-md border border-slate-300 bg-white p-1.5 text-red-500 hover:bg-red-50"
                  title="Entfernen"
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : (
              <span className="text-sm text-slate-400">
                Element aus der Palette hinzufügen, dann auf dem Feld verschieben. Klick auf
                ein Element zeigt hier die Werkzeuge.
              </span>
            )}
          </div>

          <div className="print-flaeche overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="hidden border-b border-slate-200 px-4 py-2 print:block">
              <p className="text-sm font-semibold">
                {name || PLATZ_NAMEN[platz]} · {datumKurz(heuteISO())}
              </p>
            </div>
            <svg
              ref={svgRef}
              viewBox="0 0 1000 600"
              className="w-full touch-none select-none"
              onPointerDown={() => setAuswahlId(null)}
              onPointerMove={(e) => {
                if (!drag.current) return;
                const punkt = svgPunkt(e);
                elementAendern(drag.current.id, {
                  x: Math.max(0, Math.min(1000, punkt.x + drag.current.dx)),
                  y: Math.max(0, Math.min(600, punkt.y + drag.current.dy)),
                });
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
            >
              <FeldHintergrund typ={platz} />
              {elemente.map((element) => {
                const def = ELEMENT_MAP.get(element.typ);
                if (!def) return null;
                const istAuswahl = element.id === auswahlId;
                return (
                  <g
                    key={element.id}
                    transform={`translate(${element.x} ${element.y})`}
                    style={{ cursor: "grab" }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setAuswahlId(element.id);
                      const punkt = svgPunkt(e);
                      drag.current = {
                        id: element.id,
                        dx: element.x - punkt.x,
                        dy: element.y - punkt.y,
                      };
                      try {
                        svgRef.current?.setPointerCapture(e.pointerId);
                      } catch {
                        // synthetische/abgelaufene Pointer – Drag funktioniert trotzdem
                      }
                    }}
                  >
                    {istAuswahl && (
                      <circle
                        r={(Math.max(def.breite, def.hoehe) / 2 + 8) * element.skalierung}
                        fill="rgba(2,132,199,0.08)"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                        strokeDasharray="5 4"
                        className="print-verbergen"
                      />
                    )}
                    <g transform={`rotate(${element.rotation}) scale(${element.skalierung})`}>
                      {element.typ === "text" ? (
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="18"
                          fontWeight="700"
                          fill="#0f172a"
                        >
                          {element.beschriftung || "Text"}
                        </text>
                      ) : (
                        def.render()
                      )}
                    </g>
                    {element.typ !== "text" && element.beschriftung && (
                      <text
                        y={(def.hoehe / 2) * element.skalierung + 14}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="600"
                        fill="#0f172a"
                        stroke="#fff"
                        strokeWidth="3"
                        paintOrder="stroke"
                      >
                        {element.beschriftung}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="print-verbergen mt-1.5 text-xs text-slate-400">
            {PLATZ_NAMEN[platz]} · {elemente.length} Elemente · Ziehen zum Verschieben, Klick
            zum Auswählen
          </p>
        </div>
      </div>

      {/* Setup: Anlagen & Material */}
      {(setupOffen || brauchtSetup) && (
        <SetupDialog
          konfig={konfig}
          erzwungen={brauchtSetup}
          onSpeichern={(k) => {
            einstellungSetzen("plaetze", k);
            if (!k.aktivePlaetze.includes(platz) && k.aktivePlaetze.length > 0) {
              setPlatz(k.aktivePlaetze[0]);
            }
            setSetupOffen(false);
          }}
          onSchliessen={() => setSetupOffen(false)}
        />
      )}

      {/* Pläne laden */}
      {ladenOffen && (
        <Dialog offen onSchliessen={() => setLadenOffen(false)} titel="Gespeicherte Pläne">
          {plaene.length === 0 ? (
            <p className="text-sm text-slate-500">Noch keine Pläne gespeichert.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {plaene.map((p) => (
                <li key={p.id} className="flex items-center gap-2 py-2">
                  <button
                    type="button"
                    onClick={() => laden(p)}
                    className="flex-1 rounded-md px-2 py-1 text-left hover:bg-sky-50"
                  >
                    <span className="block text-sm font-medium text-slate-900">{p.name}</span>
                    <span className="block text-xs text-slate-400">
                      {PLATZ_NAMEN[p.platz]} · {p.elemente.length} Elemente · geändert{" "}
                      {datumKurz(p.geaendertAm)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`„${p.name}" löschen?`)) {
                        platzplanLoeschen(p.id);
                        if (planId === p.id) neuerPlan();
                      }
                    }}
                    className="rounded p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-600"
                    title="Löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Dialog>
      )}
    </div>
  );
}

// ===== Einrichtung =====

function SetupDialog({
  konfig,
  erzwungen,
  onSpeichern,
  onSchliessen,
}: {
  konfig: PlatzKonfiguration;
  erzwungen: boolean;
  onSpeichern: (k: PlatzKonfiguration) => void;
  onSchliessen: () => void;
}) {
  const [aktive, setAktive] = useState<PlatzTyp[]>(konfig.aktivePlaetze);
  const [drinnen, setDrinnen] = useState<string[]>(konfig.materialDrinnen);
  const [draussen, setDraussen] = useState<string[]>(konfig.materialDraussen);

  function umschalten<T>(liste: T[], wert: T): T[] {
    return liste.includes(wert) ? liste.filter((x) => x !== wert) : [...liste, wert];
  }

  return (
    <Dialog
      offen
      onSchliessen={erzwungen ? () => {} : onSchliessen}
      titel="Meine Anlagen & Material"
      breite="max-w-2xl"
    >
      {erzwungen && (
        <p className="mb-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
          Einmal einrichten: Welche Plätze stehen dir zur Verfügung und welches Material hast
          du dort? Danach greifst du im Planer direkt auf deine Auswahl zurück.
        </p>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Meine Plätze
      </p>
      <div className="mt-1.5 flex flex-wrap gap-4">
        {ALLE_PLAETZE.map((p) => (
          <label key={p} className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={aktive.includes(p)}
              onChange={() => setAktive(umschalten(aktive, p))}
              className="h-4 w-4 accent-sky-700"
            />
            {PLATZ_NAMEN[p]}
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MaterialSpalte
          titel="Material drinnen (Halle)"
          auswahl={drinnen}
          onUmschalten={(typ) => setDrinnen(umschalten(drinnen, typ))}
          onAlle={(alle) => setDrinnen(alle ? MATERIAL_ELEMENTE.map((e) => e.typ) : [])}
        />
        <MaterialSpalte
          titel="Material draußen"
          auswahl={draussen}
          onUmschalten={(typ) => setDraussen(umschalten(draussen, typ))}
          onAlle={(alle) => setDraussen(alle ? MATERIAL_ELEMENTE.map((e) => e.typ) : [])}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() =>
            onSpeichern({
              konfiguriert: true,
              aktivePlaetze: aktive.length > 0 ? aktive : ALLE_PLAETZE,
              materialDrinnen: drinnen,
              materialDraussen: draussen,
            })
          }
          className={primaerKnopf}
        >
          Speichern
        </button>
        {!erzwungen && (
          <button type="button" onClick={onSchliessen} className={sekundaerKnopf}>
            Abbrechen
          </button>
        )}
      </div>
    </Dialog>
  );
}

function MaterialSpalte({
  titel,
  auswahl,
  onUmschalten,
  onAlle,
}: {
  titel: string;
  auswahl: string[];
  onUmschalten: (typ: string) => void;
  onAlle: (alle: boolean) => void;
}) {
  const alleAktiv = auswahl.length === MATERIAL_ELEMENTE.length;
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titel}</p>
        <button
          type="button"
          onClick={() => onAlle(!alleAktiv)}
          className="text-xs font-medium text-sky-700 hover:underline"
        >
          {alleAktiv ? "Keins" : "Alles"}
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-2">
        {MATERIAL_ELEMENTE.map((e) => (
          <label
            key={e.typ}
            className="flex cursor-pointer items-center gap-1.5 py-0.5 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={auswahl.includes(e.typ)}
              onChange={() => onUmschalten(e.typ)}
              className="h-3.5 w-3.5 accent-sky-700"
            />
            {e.label}
          </label>
        ))}
      </div>
    </div>
  );
}
