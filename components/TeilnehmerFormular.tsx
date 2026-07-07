"use client";

import { useState } from "react";
import type { Teilnehmer } from "@/lib/types";
import { neueId, useDaten } from "@/lib/store";
import { Dialog, Feld, eingabeKlasse, primaerKnopf, sekundaerKnopf } from "./ui";

export default function TeilnehmerFormular({
  teilnehmer,
  onSchliessen,
}: {
  teilnehmer: Teilnehmer | null;
  onSchliessen: () => void;
}) {
  const { teilnehmerSpeichern } = useDaten();
  const [name, setName] = useState(teilnehmer?.name ?? "");
  const [geschlecht, setGeschlecht] = useState<"m" | "w" | "">(teilnehmer?.geschlecht ?? "");
  const [geburtsdatum, setGeburtsdatum] = useState(teilnehmer?.geburtsdatum ?? "");
  const [gruppe, setGruppe] = useState(teilnehmer?.gruppe ?? "");
  const [notizen, setNotizen] = useState(teilnehmer?.notizen ?? "");

  function speichern() {
    if (!name.trim()) return;
    teilnehmerSpeichern({
      id: teilnehmer?.id ?? neueId(),
      name: name.trim(),
      geschlecht: geschlecht || undefined,
      geburtsdatum: geburtsdatum || undefined,
      gruppe: gruppe.trim() || undefined,
      notizen: notizen.trim() || undefined,
      aktiv: teilnehmer?.aktiv ?? true,
      erstelltAm: teilnehmer?.erstelltAm ?? new Date().toISOString(),
    });
    onSchliessen();
  }

  return (
    <Dialog
      offen
      onSchliessen={onSchliessen}
      titel={teilnehmer ? "Teilnehmer bearbeiten" : "Teilnehmer anlegen"}
      breite="max-w-lg"
    >
      <div className="space-y-3">
        <Feld label="Name *">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vor- und Nachname"
            className={eingabeKlasse}
            autoFocus
          />
        </Feld>
        <div className="grid grid-cols-2 gap-3">
          <Feld label="Geschlecht">
            <select
              value={geschlecht}
              onChange={(e) => setGeschlecht(e.target.value as "m" | "w" | "")}
              className={eingabeKlasse}
            >
              <option value="">–</option>
              <option value="w">Mädchen</option>
              <option value="m">Junge</option>
            </select>
          </Feld>
          <Feld label="Geburtsdatum">
            <input
              type="date"
              value={geburtsdatum}
              onChange={(e) => setGeburtsdatum(e.target.value)}
              className={eingabeKlasse}
            />
          </Feld>
        </div>
        <Feld label="Gruppe">
          <input
            value={gruppe}
            onChange={(e) => setGruppe(e.target.value)}
            placeholder="z. B. U10"
            className={eingabeKlasse}
          />
        </Feld>
        <Feld label="Notizen">
          <textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            rows={2}
            placeholder="z. B. Asthma, holt Oma ab …"
            className={eingabeKlasse}
          />
        </Feld>
        <p className="text-xs text-slate-400">
          Geburtsdatum und Geschlecht braucht die App für Altersfilter, Geburtstags-Hinweise
          und die Sportabzeichen-Anforderungen.
        </p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={speichern}
            disabled={!name.trim()}
            className={primaerKnopf}
          >
            Speichern
          </button>
          <button type="button" onClick={onSchliessen} className={sekundaerKnopf}>
            Abbrechen
          </button>
        </div>
      </div>
    </Dialog>
  );
}
