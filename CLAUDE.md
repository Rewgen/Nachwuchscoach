# Nachwuchscoach – Hinweise für Claude

Übungssammlung für einen Leichtathletik-Kindertrainer. Ziel: jede Woche schnell
passende Übungen fürs nächste Training finden (Suche, Filter, Sortierung) und
als Merkliste zusammenstellen. Sprache der UI und des Codes (Bezeichner,
Kommentare): **Deutsch**.

## Architektur

- Next.js App Router, reiner Static-Build ohne Server-Routen, **kein Login,
  kein Backend**. Drei Seiten: `/` (Katalog), `/uebung?id=…` (Detail),
  `/training` (Merkliste fürs nächste Training, `?liste=a,b,c` importiert eine
  geteilte Liste). Seiten mit `useSearchParams` brauchen `<Suspense>`.
  **Aus page.tsx nur den Default-Export** – Hilfskomponenten nach
  `components/`, Hilfslogik nach `lib/`.
- Übungen sind fest im Code: `lib/uebungen/*.ts` (nach Bereichen aufgeteilt,
  zusammengeführt in `lib/uebungen/index.ts`). Typen in `lib/types.ts`.
  Neue Übung = Objekt mit `ue({...})` in die passende Datei; IDs müssen
  eindeutig bleiben (geteilte Links und Merklisten referenzieren sie).
- Jede Übung hat eine Aufbau-Skizze als Datenliste (`skizze`), Raster
  320 × 200, Bausteine in `lib/uebungen/helfer.ts`, Darstellung in
  `components/Skizze.tsx` (Legende: `components/SkizzenLegende.tsx`).
- Filter, Sortierung, Labels, Ähnlichkeit und Materialliste: `lib/katalog.ts`.
- Zustand: `lib/speicher.tsx` (Context). Favoriten, Merkliste, Trainingsdatum
  und „fehlendes Material“ im localStorage (`nwc-*`); der Filter lebt nur im
  Speicher und überdauert so den Wechsel Katalog ↔ Detail.
- Design: hell, flach, professionell. Inter, lucide-react (KEINE Emojis in der
  App-UI). Bausteine in `components/ui.tsx`. Akzentfarbe sky-700, Radien klein
  (`rounded-md/lg`). Der Nutzer mag KEINE verspielten, überall abgerundeten
  „KI-Kinder-App“-Optiken. Auf dem Handy untere Tab-Leiste (`Kopfzeile.tsx`).
- Druck: `.print-verbergen` / `.print-flaeche` (Trainingsseite druckt mit Ablauf).
- In JS-Strings keine deutschen Anführungszeichen mit ASCII-`"` schließen
  (beendet den String) – `„…“` verwenden oder Template-Literale.

## Fachliche Regeln

- Filter „Vorhandenes Material“: abgewählt = fehlt; Übung erscheint nur, wenn
  ihr gesamtes `material` vorhanden ist. Leeres `material` = „ohne Material“.
- Altersklassen-Filter (U8/U10/U12/U14+) zeigt Übungen, deren Altersspanne
  die Klasse überschneidet.
- Merkliste wird auf der Trainingsseite nach Stundenteil gruppiert;
  Verschieben tauscht nur innerhalb desselben Stundenteils.

## Betrieb

- Live-Site: https://nachwuchscoach.netlify.app (Deploy bei Push auf `main`).
- **Workflow (Wunsch des Nutzers):** Fertige Änderungen nach Build-Check
  immer sofort auf `main` pushen – keine Feature-Branches/PRs abwarten.
- `npm run build` NIE bei laufendem `next dev` ausführen (zerschießt dessen
  `.next`-Cache → 500er; Dev-Server danach neu starten).
- `public/sw.js` (nur Produktion): Navigationen Netz-zuerst mit Cache-Fallback,
  `/_next/static/` Cache-zuerst. Bei SW-Änderungen VERSION hochzählen.
- PWA: `public/manifest.webmanifest` + Icons (`node scripts/icons.mjs`,
  braucht `npm i --no-save sharp`).
- Die frühere Vollversion (Supabase-Login, Sportabzeichen, Stoppuhr,
  Hallenplaner, Teilnehmer, Checklisten) wurde am 22.11.2026 bewusst
  entfernt; sie liegt in der Git-Historie (Commit `5077782`). Das
  Supabase-Projekt wgkockemwbnfvuylhxkl wird von der App nicht mehr genutzt.

## Roadmap (nicht ungefragt bauen)

1. Eigene Übungen anlegen/bearbeiten, Fotos/Videos zu Übungen.
2. Community-Übungen mit Prüfung/Bewertung, KI-Planung (Konzept-Datei:
   `C:\Users\nils_\Desktop\Eingangskorb\leichtathletik-app-konzept.md`).
