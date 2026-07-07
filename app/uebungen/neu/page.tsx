"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Abschnitt, Anlage, Disziplin, Ort, Uebung } from "@/lib/types";
import {
  ABSCHNITTE,
  ANLAGEN,
  DISZIPLINEN,
  MATERIAL_VORSCHLAEGE,
  ORTE,
} from "@/lib/labels";
import { neueId, useDaten } from "@/lib/store";
import MedienVerwaltung from "@/components/MedienVerwaltung";
import {
  Badge,
  Feld,
  SeitenKopf,
  eingabeKlasse,
  karteKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

export default function NeueUebungSeite() {
  return (
    <Suspense fallback={null}>
      <UebungsFormular />
    </Suspense>
  );
}

function UebungsFormular() {
  const router = useRouter();
  const params = useSearchParams();
  const bearbeitenId = params.get("id");
  const { daten, bereit, uebungSpeichern, mediumLoeschen } = useDaten();

  // Für neue Übungen wird die ID vorab erzeugt, damit Medien-Uploads sofort
  // andocken können. Bei Abbruch werden diese Uploads wieder entfernt.
  const [uebungId] = useState(() => bearbeitenId ?? neueId());
  const hochgeladen = useRef<string[]>([]);

  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [variationen, setVariationen] = useState("");
  const [abschnitt, setAbschnitt] = useState<Abschnitt>("hauptteil");
  const [disziplinen, setDisziplinen] = useState<Disziplin[]>([]);
  const [ort, setOrt] = useState<Ort>("beides");
  const [anlagen, setAnlagen] = useState<Anlage[]>([]);
  const [material, setMaterial] = useState<string[]>([]);
  const [materialEingabe, setMaterialEingabe] = useState("");
  const [altersVon, setAltersVon] = useState("6");
  const [altersBis, setAltersBis] = useState("12");
  const [gruppeMin, setGruppeMin] = useState("4");
  const [gruppeMax, setGruppeMax] = useState("");
  const [dauer, setDauer] = useState("10");
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    if (!bereit || geladen) return;
    if (bearbeitenId) {
      const u = daten.uebungen.find((x) => x.id === bearbeitenId);
      if (u) {
        setTitel(u.titel);
        setBeschreibung(u.beschreibung);
        setVariationen(u.variationen ?? "");
        setAbschnitt(u.abschnitt);
        setDisziplinen(u.disziplinen);
        setOrt(u.ort);
        setAnlagen(u.anlagen);
        setMaterial(u.material);
        setAltersVon(String(u.altersVon));
        setAltersBis(String(u.altersBis));
        setGruppeMin(String(u.gruppeMin));
        setGruppeMax(u.gruppeMax === null ? "" : String(u.gruppeMax));
        setDauer(String(u.dauer));
      }
    }
    setGeladen(true);
  }, [bereit, geladen, bearbeitenId, daten.uebungen]);

  function materialHinzufuegen(wert: string) {
    const sauber = wert.trim();
    if (sauber && !material.includes(sauber)) setMaterial([...material, sauber]);
    setMaterialEingabe("");
  }

  function umschalten<T>(liste: T[], wert: T): T[] {
    return liste.includes(wert) ? liste.filter((x) => x !== wert) : [...liste, wert];
  }

  function speichern() {
    if (!titel.trim() || !beschreibung.trim()) return;
    const bestehend = bearbeitenId
      ? daten.uebungen.find((x) => x.id === bearbeitenId)
      : undefined;
    const uebung: Uebung = {
      id: uebungId,
      titel: titel.trim(),
      beschreibung: beschreibung.trim(),
      variationen: variationen.trim() || undefined,
      abschnitt,
      disziplinen,
      ort,
      anlagen,
      material,
      altersVon: parseInt(altersVon, 10) || 5,
      altersBis: parseInt(altersBis, 10) || 14,
      gruppeMin: parseInt(gruppeMin, 10) || 1,
      gruppeMax: gruppeMax.trim() === "" ? null : parseInt(gruppeMax, 10) || null,
      dauer: parseInt(dauer, 10) || 10,
      favorit: bestehend?.favorit ?? false,
      eigene: bestehend?.eigene ?? true,
      erstelltAm: bestehend?.erstelltAm ?? new Date().toISOString(),
    };
    uebungSpeichern(uebung);
    hochgeladen.current = []; // gehören jetzt zur gespeicherten Übung
    router.push("/uebungen");
  }

  function abbrechen() {
    // Bei einer nie gespeicherten Übung verwaiste Uploads entfernen.
    if (!bearbeitenId) {
      hochgeladen.current.forEach((id) => mediumLoeschen(id));
    }
    router.back();
  }

  if (!bereit) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <SeitenKopf titel={bearbeitenId ? "Übung bearbeiten" : "Neue Übung anlegen"} />

      <div className={`${karteKlasse} space-y-4 p-5`}>
        <Feld label="Titel *">
          <input
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder="z. B. Hütchen-Sprintduell"
            className={eingabeKlasse}
          />
        </Feld>

        <Feld label="Beschreibung *">
          <textarea
            value={beschreibung}
            onChange={(e) => setBeschreibung(e.target.value)}
            rows={5}
            placeholder="Aufbau, Ablauf, worauf du achtest …"
            className={eingabeKlasse}
          />
        </Feld>

        <Feld label="Variationen (optional)">
          <textarea
            value={variationen}
            onChange={(e) => setVariationen(e.target.value)}
            rows={2}
            placeholder="Leichter/schwerer machen, Varianten …"
            className={eingabeKlasse}
          />
        </Feld>

        <div className="border-t border-slate-100 pt-4">
          <MedienVerwaltung
            uebungId={uebungId}
            onHochgeladen={(id) => hochgeladen.current.push(id)}
          />
        </div>

        <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <Feld label="Trainingsabschnitt">
            <select
              value={abschnitt}
              onChange={(e) => setAbschnitt(e.target.value as Abschnitt)}
              className={eingabeKlasse}
            >
              {ABSCHNITTE.map((a) => (
                <option key={a.wert} value={a.wert}>
                  {a.label}
                </option>
              ))}
            </select>
          </Feld>
          <Feld label="Ort">
            <select
              value={ort}
              onChange={(e) => setOrt(e.target.value as Ort)}
              className={eingabeKlasse}
            >
              {ORTE.map((o) => (
                <option key={o.wert} value={o.wert}>
                  {o.label}
                </option>
              ))}
            </select>
          </Feld>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-600">Disziplinen (optional)</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {DISZIPLINEN.map((d) => (
              <button
                key={d.wert}
                type="button"
                onClick={() => setDisziplinen(umschalten(disziplinen, d.wert))}
                className={`rounded-md border px-2.5 py-1 text-sm font-medium transition-colors ${
                  disziplinen.includes(d.wert)
                    ? "border-sky-700 bg-sky-700 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-sky-600 hover:text-sky-800"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-600">
            Benötigte Anlagen (nur ankreuzen, wenn ohne nicht machbar)
          </p>
          <div className="mt-1.5 flex flex-wrap gap-4">
            {ANLAGEN.map((a) => (
              <label
                key={a.wert}
                className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={anlagen.includes(a.wert)}
                  onChange={() => setAnlagen(umschalten(anlagen, a.wert))}
                  className="h-3.5 w-3.5 accent-sky-700"
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-600">
            Benötigtes Material (leer lassen = ohne Material)
          </p>
          {material.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {material.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMaterial(material.filter((x) => x !== m))}
                  title="Entfernen"
                >
                  <Badge className="border-sky-200 bg-sky-50 text-sky-800">{m} ✕</Badge>
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <input
              value={materialEingabe}
              onChange={(e) => setMaterialEingabe(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  materialHinzufuegen(materialEingabe);
                }
              }}
              placeholder="Material eintippen und Enter drücken …"
              className={`${eingabeKlasse} flex-1`}
            />
            <button
              type="button"
              onClick={() => materialHinzufuegen(materialEingabe)}
              className={sekundaerKnopf}
            >
              Hinzufügen
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {MATERIAL_VORSCHLAEGE.filter((m) => !material.includes(m)).map((m) => (
              <button key={m} type="button" onClick={() => materialHinzufuegen(m)}>
                <Badge className="border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:text-sky-800">
                  + {m}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Feld label="Alter von">
            <input
              type="number"
              min={4}
              max={17}
              value={altersVon}
              onChange={(e) => setAltersVon(e.target.value)}
              className={eingabeKlasse}
            />
          </Feld>
          <Feld label="Alter bis">
            <input
              type="number"
              min={4}
              max={17}
              value={altersBis}
              onChange={(e) => setAltersBis(e.target.value)}
              className={eingabeKlasse}
            />
          </Feld>
          <Feld label="Kinder min.">
            <input
              type="number"
              min={1}
              value={gruppeMin}
              onChange={(e) => setGruppeMin(e.target.value)}
              className={eingabeKlasse}
            />
          </Feld>
          <Feld label="Kinder max.">
            <input
              type="number"
              min={1}
              value={gruppeMax}
              onChange={(e) => setGruppeMax(e.target.value)}
              placeholder="offen"
              className={eingabeKlasse}
            />
          </Feld>
          <Feld label="Dauer (Min.)">
            <input
              type="number"
              min={1}
              value={dauer}
              onChange={(e) => setDauer(e.target.value)}
              className={eingabeKlasse}
            />
          </Feld>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={speichern}
          disabled={!titel.trim() || !beschreibung.trim()}
          className={primaerKnopf}
        >
          {bearbeitenId ? "Änderungen speichern" : "Übung speichern"}
        </button>
        <button type="button" onClick={abbrechen} className={sekundaerKnopf}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}
