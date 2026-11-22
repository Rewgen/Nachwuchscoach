# Nachwuchscoach

Übungssammlung für die Kinder- und Jugendleichtathletik: 73 Spiele und Übungen
mit Aufbau-Skizze, Ablauf, Coaching-Tipps und Variationen – durchsuchbar,
filterbar und sortierbar. Ausgewählte Übungen landen auf der Merkliste fürs
nächste Training.

## Starten

```bash
npm install   # einmalig
npm run dev   # dann http://localhost:3000
```

## Funktionen

| Bereich | Was es kann |
| --- | --- |
| **Übungen** | Volltextsuche (umlauttolerant), Stundenteil-Tabs mit Zählern, Schwerpunkte (Sprint, Hürden, Sprung, Wurf, Ausdauer, Koordination, Kräftigung), Filter nach Altersklasse U8–U14+, Halle/draußen, Form, Dauer, „ohne Material“, Favoriten und vorhandenem Material; Sortierung nach Stundenablauf, A–Z, Dauer, Materialaufwand, Intensität |
| **Übungsdetail** | Große Aufbau-Skizze mit Legende, Kennzahlen (Dauer, Alter, Gruppe, Intensität), Ziel, Material, Aufbau, Ablauf in Schritten, Coaching-Tipps, Variationen, „Passt dazu“ |
| **Training planen** | Merkliste gruppiert nach Aufwärmen/Hauptteil/Abschluss, Gesamtdauer mit Phasenbalken, Reihenfolge ändern, am Platz abhaken, Ablauf aufklappen, Materialliste zum Einpacken, Drucken, per Link teilen (z. B. vom PC aufs Handy) |

Alles bleibt auf dem Gerät (localStorage), es gibt kein Konto und keinen Server.

## Technik

Next.js 15 (App Router, statisch) · React 19 · TypeScript · Tailwind CSS 4 ·
lucide-react · PWA mit Service Worker.
