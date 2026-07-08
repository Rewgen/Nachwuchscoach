"use client";

import { useRef, useState } from "react";
import {
  Download,
  HardDriveUpload,
  LogOut,
  MapPin,
  Search,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { useDaten } from "@/lib/store";
import { SEED_UEBUNGEN } from "@/lib/seed";
import { orteSuchen, type GeoTreffer } from "@/lib/wetter";
import type { WetterOrt } from "@/lib/types";
import {
  Feld,
  SeitenKopf,
  eingabeKlasse,
  gefahrKnopf,
  karteKlasse,
  primaerKnopf,
  sekundaerKnopf,
} from "@/components/ui";

export default function DatenSeite() {
  const {
    daten,
    bereit,
    datenImportieren,
    lokaleDatenUebernehmen,
    einstellungSetzen,
    nutzerEmail,
    abmelden,
  } = useDaten();
  const dateiInput = useRef<HTMLInputElement>(null);
  const [modus, setModus] = useState<"zusammenfuehren" | "ersetzen">("zusammenfuehren");
  const [meldung, setMeldung] = useState<{ text: string; fehler: boolean } | null>(null);
  const [laeuft, setLaeuft] = useState<string | null>(null);

  if (!bereit) return null;

  function exportieren() {
    const blob = new Blob([JSON.stringify(daten, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nachwuchscoach-sicherung-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importieren(datei: File) {
    const leser = new FileReader();
    leser.onload = async () => {
      setLaeuft("Importiert …");
      const fehler = await datenImportieren(String(leser.result), modus);
      setLaeuft(null);
      setMeldung(
        fehler
          ? { text: fehler, fehler: true }
          : { text: "Daten erfolgreich importiert.", fehler: false }
      );
    };
    leser.readAsText(datei);
  }

  async function uebernehmen() {
    setLaeuft("Übernimmt lokale Daten (inkl. Medien) …");
    const fehler = await lokaleDatenUebernehmen();
    setLaeuft(null);
    setMeldung(
      fehler
        ? { text: fehler, fehler: true }
        : {
            text: "Lokale Daten übernommen – Übungen, Trainings, Teilnehmer und Medien sind jetzt in deinem Konto.",
            fehler: false,
          }
    );
  }

  async function zuruecksetzen() {
    if (
      window.confirm(
        "Wirklich alles zurücksetzen? Übungen, Trainings, Teilnehmer, Leistungen und Sportabzeichen-Ergebnisse in deinem Konto werden gelöscht und der Übungs-Startbestand wiederhergestellt. Vorher besser eine Sicherung exportieren!"
      )
    ) {
      setLaeuft("Setzt zurück …");
      const fehler = await datenImportieren(
        JSON.stringify({ uebungen: SEED_UEBUNGEN }),
        "ersetzen"
      );
      setLaeuft(null);
      setMeldung(
        fehler
          ? { text: fehler, fehler: true }
          : { text: "Alles zurückgesetzt – Startbestand wiederhergestellt.", fehler: false }
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <SeitenKopf
        titel="Daten & Einstellungen"
        beschreibung="Deine Daten liegen in deinem Konto (Supabase) und stehen auf allen Geräten zur Verfügung."
      />

      {laeuft && (
        <p className="mb-4 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
          {laeuft}
        </p>
      )}
      {meldung && !laeuft && (
        <p
          className={`mb-4 rounded-md border px-4 py-3 text-sm font-medium ${
            meldung.fehler
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {meldung.text}
        </p>
      )}

      {/* Konto */}
      <div className={`${karteKlasse} p-5`}>
        <h2 className="font-semibold text-slate-900">Konto</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <UserRound size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {nutzerEmail ?? "Angemeldet"}
            </p>
            <p className="text-xs text-slate-400">Angemeldet mit Google</p>
          </div>
          <button type="button" onClick={abmelden} className={sekundaerKnopf}>
            <LogOut size={14} />
            Abmelden
          </button>
        </div>
      </div>

      {/* Übernahme alter lokaler Daten */}
      <div className={`${karteKlasse} mt-4 p-5`}>
        <h2 className="font-semibold text-slate-900">Alte lokale Daten übernehmen</h2>
        <p className="mt-1 text-sm text-slate-500">
          Holt die Daten der früheren lokalen Version (SQLite auf diesem PC) einmalig in dein
          Konto – inklusive hochgeladener Bilder und Videos. Funktioniert nur am PC, auf dem
          die alte Version lief.
        </p>
        <button
          type="button"
          onClick={uebernehmen}
          disabled={!!laeuft}
          className={`${primaerKnopf} mt-3`}
        >
          <HardDriveUpload size={15} />
          Lokale Daten übernehmen
        </button>
      </div>

      {/* Wetter-Ort */}
      <div className={`${karteKlasse} mt-4 p-5`}>
        <h2 className="font-semibold text-slate-900">Wetter-Ort</h2>
        <p className="mt-1 text-sm text-slate-500">
          Für die Wettervorhersage bei geplanten Außentrainings (Open-Meteo, kostenlos, ohne
          Anmeldung).
        </p>
        <WetterOrtEinstellung
          aktuell={daten.einstellungen["wetter-ort"] as WetterOrt | undefined}
          onSetzen={(ort) => einstellungSetzen("wetter-ort", ort)}
        />
      </div>

      {/* Sicherung */}
      <div className={`${karteKlasse} mt-4 p-5`}>
        <h2 className="font-semibold text-slate-900">Sicherung</h2>
        <p className="mt-1 text-sm text-slate-500">
          {daten.uebungen.length} Übungen · {daten.trainings.length} Trainings ·{" "}
          {daten.teilnehmer.length} Teilnehmer · {daten.leistungen.length} Leistungen ·{" "}
          {daten.medien.length} Medien
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={exportieren} className={primaerKnopf}>
            <Download size={15} />
            Sicherung exportieren
          </button>
          <button
            type="button"
            onClick={() => dateiInput.current?.click()}
            disabled={!!laeuft}
            className={sekundaerKnopf}
          >
            <Upload size={15} />
            Sicherung importieren
          </button>
          <select
            value={modus}
            onChange={(e) => setModus(e.target.value as typeof modus)}
            className={eingabeKlasse}
            title="Import-Modus"
          >
            <option value="zusammenfuehren">Import: zusammenführen</option>
            <option value="ersetzen">Import: alles ersetzen</option>
          </select>
          <input
            ref={dateiInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const datei = e.target.files?.[0];
              if (datei) importieren(datei);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Die JSON-Sicherung enthält alle Daten außer den Bild-/Videodateien selbst – die
          liegen im Supabase-Storage deines Kontos.
        </p>
      </div>

      {/* Zurücksetzen */}
      <div className={`${karteKlasse} mt-4 border-red-200 p-5`}>
        <h2 className="font-semibold text-slate-900">Zurücksetzen</h2>
        <p className="mt-1 text-sm text-slate-500">
          Löscht alle Daten in deinem Konto und stellt den mitgelieferten
          Übungs-Startbestand wieder her.
        </p>
        <button
          type="button"
          onClick={zuruecksetzen}
          disabled={!!laeuft}
          className={`${gefahrKnopf} mt-3`}
        >
          <Trash2 size={14} />
          Alles zurücksetzen
        </button>
      </div>
    </div>
  );
}

function WetterOrtEinstellung({
  aktuell,
  onSetzen,
}: {
  aktuell?: WetterOrt;
  onSetzen: (ort: WetterOrt | null) => void;
}) {
  const [suche, setSuche] = useState("");
  const [treffer, setTreffer] = useState<GeoTreffer[]>([]);
  const [laedt, setLaedt] = useState(false);

  async function suchen() {
    if (!suche.trim()) return;
    setLaedt(true);
    setTreffer(await orteSuchen(suche.trim()));
    setLaedt(false);
  }

  return (
    <div className="mt-3">
      {aktuell ? (
        <p className="flex items-center gap-2 text-sm">
          <MapPin size={15} className="text-sky-700" />
          <span className="font-medium text-slate-800">{aktuell.name}</span>
          <button
            type="button"
            onClick={() => onSetzen(null)}
            className="text-xs font-medium text-slate-400 hover:text-red-600 hover:underline"
          >
            entfernen
          </button>
        </p>
      ) : (
        <p className="text-sm text-slate-400">Noch kein Ort eingestellt.</p>
      )}
      <div className="mt-2 flex gap-2">
        <input
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void suchen();
          }}
          placeholder="Ort suchen, z. B. Duisburg …"
          className={`${eingabeKlasse} flex-1`}
        />
        <button type="button" onClick={suchen} disabled={laedt} className={sekundaerKnopf}>
          <Search size={15} />
          {laedt ? "Sucht …" : "Suchen"}
        </button>
      </div>
      {treffer.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-md border border-slate-200">
          {treffer.map((t, i) => (
            <li key={i} className={i > 0 ? "border-t border-slate-100" : ""}>
              <button
                type="button"
                onClick={() => {
                  onSetzen({ name: t.name, lat: t.lat, lon: t.lon });
                  setTreffer([]);
                  setSuche("");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-sky-50"
              >
                <MapPin size={14} className="text-slate-400" />
                <span className="font-medium text-slate-800">{t.name}</span>
                <span className="text-xs text-slate-400">
                  {[t.verwaltung, t.land].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
