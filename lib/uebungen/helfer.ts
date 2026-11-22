import type { Punkt, SkizzenElement, Uebung } from "../types";

// Kurzschreibweisen für die Skizzen. Feld: 320 × 200.

type Team = 0 | 1 | 2 | 3;
type Farbe = 0 | 1 | 2 | 3;

export const kind = (x: number, y: number, team: Team = 0): SkizzenElement => ({
  t: "kind",
  p: [x, y],
  team,
});

export const kinder = (team: Team, ...punkte: Punkt[]): SkizzenElement[] =>
  punkte.map((p) => ({ t: "kind", p, team }));

export const trainer = (x: number, y: number): SkizzenElement => ({ t: "trainer", p: [x, y] });

export const huetchen = (x: number, y: number, farbe: Farbe = 0): SkizzenElement => ({
  t: "huetchen",
  p: [x, y],
  farbe,
});

/** n Hütchen gleichmäßig von (x1,y1) bis (x2,y2). */
export function huetchenReihe(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  n: number,
  farbe: Farbe = 0
): SkizzenElement[] {
  return Array.from({ length: n }, (_, i) => {
    const f = n === 1 ? 0 : i / (n - 1);
    return huetchen(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, farbe);
  });
}

/** Vier Hütchen als Feldbegrenzung. */
export const feldEcken = (x1: number, y1: number, x2: number, y2: number, farbe: Farbe = 0) => [
  huetchen(x1, y1, farbe),
  huetchen(x2, y1, farbe),
  huetchen(x1, y2, farbe),
  huetchen(x2, y2, farbe),
];

export const lauf = (...pfad: Punkt[]): SkizzenElement => ({ t: "weg", pfad, art: "lauf" });
export const sprint = (...pfad: Punkt[]): SkizzenElement => ({ t: "weg", pfad, art: "sprint" });
export const locker = (...pfad: Punkt[]): SkizzenElement => ({ t: "weg", pfad, art: "locker" });
export const sprung = (...pfad: Punkt[]): SkizzenElement => ({ t: "weg", pfad, art: "sprung" });
export const wurf = (...pfad: Punkt[]): SkizzenElement => ({ t: "weg", pfad, art: "wurf" });

export const linie = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  art: "start" | "markierung" = "markierung"
): SkizzenElement => ({ t: "linie", a: [x1, y1], b: [x2, y2], art });

export const reifen = (x: number, y: number): SkizzenElement => ({ t: "reifen", p: [x, y] });
export const ball = (x: number, y: number, gross = false): SkizzenElement => ({
  t: "ball",
  p: [x, y],
  gross,
});
export const huerde = (x: number, y: number): SkizzenElement => ({ t: "huerde", p: [x, y] });

export const flaeche = (
  x: number,
  y: number,
  w: number,
  h: number,
  art: "matte" | "sand" | "zone" | "kasten" | "weichboden",
  text?: string
): SkizzenElement => ({ t: "flaeche", p: [x, y], w, h, art, text });

export const bank = (x1: number, y1: number, x2: number, y2: number): SkizzenElement => ({
  t: "bank",
  a: [x1, y1],
  b: [x2, y2],
});

export const leiter = (x1: number, y1: number, x2: number, y2: number): SkizzenElement => ({
  t: "leiter",
  a: [x1, y1],
  b: [x2, y2],
});

export const seil = (...pfad: Punkt[]): SkizzenElement => ({ t: "seil", pfad });
export const text = (x: number, y: number, s: string): SkizzenElement => ({ t: "text", p: [x, y], s });

/** Kinder locker im Feld verteilt (feste Positionen, damit die Skizze stabil bleibt). */
export const verteilt = (team: Team = 0): SkizzenElement[] =>
  kinder(
    team,
    [70, 60],
    [130, 45],
    [200, 70],
    [255, 50],
    [95, 120],
    [188, 108],
    [235, 130],
    [60, 160],
    [140, 165],
    [215, 170],
    [270, 155]
  );

export const ue = (u: Uebung): Uebung => u;
