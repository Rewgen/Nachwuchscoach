# Nachwuchscoach

Trainingsplattform für die Kinderleichtathletik: Übungsdatenbank, Trainingsplaner
mit Generator, Trainingslog, Teilnehmerverwaltung mit Leistungsentwicklung,
Deutsches Sportabzeichen (Laufzettel & Abnahmeliste), Hallen-/Platzplaner,
Mehrpersonen-Stoppuhr, Checklisten und Wettervorhersage.

## Starten

```bash
npm install   # einmalig
npm run dev   # dann http://localhost:3000
```

Vom Handy im selben WLAN erreichbar unter `http://<PC-IP>:3000`.

## Funktionen

| Bereich | Was es kann |
| --- | --- |
| **Übungen** | 35 Startübungen, Facetten-Filter (Abschnitt, Disziplin, Ort, vorhandene Anlagen, Material, Alter, Gruppengröße), Volltextsuche, Favoriten, eigene Übungen, **Bilder-Serien & Videos** (Upload oder YouTube-Link) |
| **Training planen** | Merkliste aus der Datenbank, Vorschlags-Generator (Dauer, Schwerpunkt, Rahmenbedingungen; bevorzugt Favoriten und gut bewertete Übungen), Dauer/Notizen pro Übung, automatische Materialliste, Vorlagen aus alten Trainings, Druckansicht |
| **Trainingslog** | Training abschließen mit Reflexion (lief gut / lief nicht / nächstes Mal) und Bewertung pro Übung; Einsatz-Historie an jeder Übung |
| **Teilnehmer** | Stammdaten, Geburtstags-Erinnerungen, Leistungserfassung (feste + eigene Disziplinen), Entwicklungs-Diagramme pro Disziplin, Sportabzeichen-Historie |
| **Sportabzeichen** | Offizielle DSA-Anforderungen (KiJu), Teilnahme pro Jahr, Ergebniserfassung mit automatischer Medaillen-/Punktewertung, Laufzettel-Druck (Querformat, Farbvarianten, Rückseite mit Zonenweitsprung-Tabelle), Prüfer-Notizzettel, Ergebnisliste, CSV-Export |
| **Hallen-/Platzplaner** | 3 Felder (Sporthalle, Tartanplatz, 400m-Bahn mit Rasen), einmalige Einrichtung der eigenen Plätze + Material-Ausstattung (drinnen/draußen), Drag&Drop-Elemente, Beschriftung/Rotation/Größe, Pläne speichern und drucken |
| **Stoppuhr** | Eine Uhr für mehrere Kinder, Runden- und Zielzeiten pro Kind, Übernahme in Teilnehmerprofile |
| **Checklisten** | Packlisten für Training/Events, Vorlage, Fortschritt, Duplizieren |
| **Wetter** | Open-Meteo-Vorhersage (ohne API-Schlüssel) für geplante Außentrainings; Ort unter Daten & Einstellungen |

## Technik

- **Next.js 15** (App Router) + React 19 + TypeScript + Tailwind CSS 4 + lucide-react
- **Backend**: **Supabase** – Google-Login, Postgres mit Row Level Security
  (jeder Account sieht nur die eigenen Daten), Storage-Bucket für Medien.
  Datenzugriff im Client ausschließlich über `lib/store.tsx`.
- **Konfiguration**: `.env.local` mit `NEXT_PUBLIC_SUPABASE_URL` und
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Vorlage: `.env.local.beispiel`); dieselben
  Variablen sind auf Netlify gesetzt. Datenbank-Schema: `supabase/schema.sql`
  (einmalig im Supabase SQL-Editor ausführen).
- **Hosting**: Netlify (https://nachwuchscoach.netlify.app), Deploy bei Push
  auf `main`.
- Die alten SQLite-API-Routen (`app/api/*`, `lib/server/*`) sind veraltet und
  dienen nur noch der einmaligen Übernahme lokaler Altdaten („Daten &
  Einstellungen“ → „Lokale Daten übernehmen“, inkl. Mediendateien).
- Design: hell, flach, Inter; Seitenleiste am Desktop, Tab-Leiste am Handy

## Roadmap

1. Offline-Modus als PWA (lokaler Cache + Schreib-Warteschlange, Sync bei
   Wiederverbindung)
2. Alte SQLite-Schicht entfernen, sobald die Datenübernahme erledigt ist
3. Später laut Konzept: Community-Übungen mit Prüfung/Bewertung,
   Videoproduktion, KI-Trainingsplanung, Ausbau auf Sportunterricht
