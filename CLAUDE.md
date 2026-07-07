# Nachwuchscoach – Hinweise für Claude

Trainingsplattform für einen Leichtathletik-Kindertrainer. Sprache der UI und
des Codes (Bezeichner, Kommentare): **Deutsch**.

## Architektur

- Next.js App Router; alle Seiten sind Client-Komponenten, Daten kommen per
  `useDaten()` aus `lib/store.tsx` (lädt einmal `GET /api/daten`, Mutationen
  optimistisch + API-Call). **Neue Entitäten immer durch alle Schichten
  ziehen**: `lib/types.ts` → `lib/server/db.ts` (Tabelle + Repo + gesamtDaten +
  importieren) → `app/api/<entität>/route.ts` → `lib/store.tsx`.
- SQLite (`better-sqlite3`) in `./daten/nachwuchscoach.db`, Uploads in
  `./daten/uploads` (Auslieferung über `/api/medien/datei/[name]`). Tabellen
  speichern JSON-Payloads (`id` + `json`).
- Detailseiten über Query-Parameter statt dynamischer Routen
  (`?id=…`, `?vorlage=…`, `?jahr=…`); Seiten mit `useSearchParams` brauchen
  `<Suspense>`. **Aus page.tsx nur den Default-Export** – Hilfskomponenten
  nach `components/`, Hilfslogik nach `lib/`.
- Design: hell, flach, professionell. Inter, lucide-react (KEINE Emojis in der
  App-UI; Ausnahme: kindgerechte Drucksachen wie der Sportabzeichen-Laufzettel).
  Bausteine/Klassen in `components/ui.tsx` (`primaerKnopf`, `eingabeKlasse`,
  `karteKlasse` …). Akzentfarbe sky-700, Radien klein (`rounded-md/lg`).
  Der Nutzer mag KEINE verspielten, überall abgerundeten „KI-Kinder-App"-Optiken.
- Druck: `.print-verbergen` / `.print-flaeche`; Sportabzeichen-Drucksachen und
  Planer nutzen eigene `<style>`-Blöcke mit `@page landscape`.
- In JS-Strings keine deutschen Anführungszeichen mit ASCII-`"` schließen
  (beendet den String) – `„…“` verwenden oder Template-Literale.

## Fachliche Regeln

- Übungs-Filter „Verfügbare Anlagen“: abgewählt = fehlt; Übung erscheint nur,
  wenn alle ihre `anlagen` verfügbar sind. Leeres `material` = „ohne Material“.
- Merkliste (`entwurf` im Store, localStorage) befüllt den Planer und wird nach
  dem Speichern geleert.
- Sportabzeichen (`lib/sportabzeichen.ts`, Werte aus der Referenz-HTML des
  Nutzers): AK = Wettkampfjahr − Geburtsjahr; Ausdauer 1 Versuch, Zonenweitsprung
  4 (Summe der besten 3), sonst 3; Punkte B1/S2/G3, gesamt 4–7/8–10/11–12;
  alle 4 Gruppen nötig. Referenzdatei (wird vom Nutzer noch erweitert!):
  `C:\Users\nils_\Desktop\Referenzsystem\Etus Wedau\Sportabzeichen\Anforderungskarten\Sportabzeichen 2026 - Laufzettel & Abnahmeliste.html`
- Gelöschte Übungen in Trainings als „(gelöschte Übung)“ anzeigen.
- Planer: Feld-Raster 1000×600; Elementkatalog in
  `components/planer/elemente.tsx`; Platz-/Material-Konfiguration im
  Einstellungs-Key `plaetze`.

## Roadmap (nicht ungefragt bauen)

1. **Google-Login + Sync + Offline**: Migration des Stores auf Supabase
   (Google-Auth, Postgres, Storage) + Hosting. Wartet auf Supabase-Projekt und
   OAuth-Zugangsdaten des Nutzers. Danach PWA/Offline-Warteschlange.
2. Community-Übungen mit Prüfung/Bewertung, Videos, KI-Planung (Konzept-Datei:
   `C:\Users\nils_\Desktop\Eingangskorb\leichtathletik-app-konzept.md`).
