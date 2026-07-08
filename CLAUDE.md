# Nachwuchscoach – Hinweise für Claude

Trainingsplattform für einen Leichtathletik-Kindertrainer. Sprache der UI und
des Codes (Bezeichner, Kommentare): **Deutsch**.

## Architektur

- Next.js App Router; alle Seiten sind Client-Komponenten, Daten kommen per
  `useDaten()` aus `lib/store.tsx` – seit der Supabase-Migration lädt der
  Store alles direkt aus **Supabase** (Google-Auth, Postgres mit RLS pro
  Nutzer, Storage-Bucket `medien`). **Neue Entitäten immer durch alle
  Schichten ziehen**: `lib/types.ts` → `supabase/schema.sql` (Tabelle
  `id`/`user_id`/`json` + RLS-Policy) → `lib/store.tsx` (laden, upsert,
  löschen, Import/Export in `datenSchreiben`/`allesLaden`/`allesLoeschen`).
- Client-Setup in `lib/supabase.ts`: Client ist `null`, wenn die Env-Variablen
  fehlen (`.env.local`, Vorlage `.env.local.beispiel`) – die App zeigt dann
  einen Hinweis statt abzustürzen. Login-Gate liegt in
  `components/AppShell.tsx` (rendert `LoginSeite`, solange weder Konto noch
  Gast-Modus aktiv sind).
- **Gast-Modus** (App ohne Konto): Flag `nachwuchscoach-gastmodus` +
  Daten im Offline-Cache unter der Pseudo-User-ID `gast`. Der Store schreibt
  für Gäste NICHT nach Supabase (`gastRef`-Guard in `schreiben`); der
  Cache-Effekt persistiert alles. Beim Login werden Gast-Daten mit
  `hatEigeneInhalte` geprüft, per `datenSchreiben` ins Konto gehoben und der
  Gast-Cache gelöscht. Datei-Uploads sind Gästen nicht möglich (Storage-RLS),
  YouTube-Links schon.
- Die frühere SQLite-Schicht (`lib/server`, `app/api`, better-sqlite3) wurde
  am 08.07.2026 nach erfolgreicher Datenübernahme entfernt – die App ist ein
  reiner Static-Build ohne eigene Server-Routen.
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

## Betrieb

- Supabase-Projekt: https://wgkockemwbnfvuylhxkl.supabase.co ·
  Live-Site: https://nachwuchscoach.netlify.app (Deploy bei Push auf `main`).
- Google-OAuth läuft im Testmodus: nur nils.negwer@gmail.com kann sich
  anmelden; weitere Nutzer als Testnutzer in der Google Cloud Console
  eintragen.
- `npm run build` NIE bei laufendem `next dev` ausführen (zerschießt dessen
  `.next`-Cache → 500er; Dev-Server danach neu starten).

## Offline-Architektur

- `lib/offline.ts`: Datencache + Schreib-Warteschlange pro Nutzer
  (localStorage). Der Store reiht JEDE Schreibaktion ein und flusht sofort –
  bei Netzfehlern bleibt sie liegen und wird beim online-Event in Reihenfolge
  nachgezogen. Fachliche Fehler (z. B. RLS) werden geloggt und NICHT
  wiederholt. Datei-Uploads/Import/Export brauchen bewusst eine Verbindung.
- `public/sw.js` (nur Produktion, Registrierung in
  `components/ServiceWorkerRegistrierung.tsx`): Navigationen Netz-zuerst mit
  Cache-Fallback auf `/`, `/_next/static/` und Storage-Medien Cache-zuerst.
  Bei SW-Änderungen die VERSION-Konstante hochzählen.

- PWA: `public/manifest.webmanifest` + Icons (`node scripts/icons.mjs`,
  braucht `npm i --no-save sharp`) → „App installieren“ auf Android.

## Roadmap (nicht ungefragt bauen)

1. Community-Übungen mit Prüfung/Bewertung, Videos, KI-Planung (Konzept-Datei:
   `C:\Users\nils_\Desktop\Eingangskorb\leichtathletik-app-konzept.md`).
