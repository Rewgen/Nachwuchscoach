import type { SkizzenElement } from "@/lib/types";
import Skizze from "./Skizze";

const EINTRAEGE: { label: string; el: SkizzenElement; viewBox?: string }[] = [
  { label: "Kind", el: { t: "kind", p: [14, 8] } },
  { label: "Trainer", el: { t: "trainer", p: [14, 8] } },
  { label: "Hütchen", el: { t: "huetchen", p: [14, 9] } },
  { label: "Laufweg", el: { t: "weg", pfad: [[2, 8], [26, 8]], art: "lauf" } },
  { label: "Sprint", el: { t: "weg", pfad: [[2, 8], [26, 8]], art: "sprint" } },
  { label: "locker / zurück", el: { t: "weg", pfad: [[2, 8], [26, 8]], art: "locker" } },
  { label: "Sprünge", el: { t: "weg", pfad: [[2, 14], [26, 14]], art: "sprung" } },
  { label: "Wurf", el: { t: "weg", pfad: [[2, 13], [26, 13]], art: "wurf" } },
  { label: "Reifen", el: { t: "reifen", p: [14, 8] }, viewBox: "0 -4 28 24" },
  { label: "Hürde", el: { t: "huerde", p: [14, 8] }, viewBox: "0 -5 28 26" },
  { label: "Seil / Schnur", el: { t: "seil", pfad: [[2, 11], [10, 5], [18, 11], [26, 5]] } },
];

function kommtVor(elemente: SkizzenElement[], e: SkizzenElement): boolean {
  return elemente.some((x) => {
    if (x.t !== e.t) return false;
    if (x.t === "weg" && e.t === "weg") return (x.art ?? "lauf") === (e.art ?? "lauf");
    return true;
  });
}

/** Zeigt nur die Symbole, die in der Skizze wirklich vorkommen. */
export default function SkizzenLegende({ elemente }: { elemente: SkizzenElement[] }) {
  const sichtbar = EINTRAEGE.filter((e) => kommtVor(elemente, e.el));
  if (sichtbar.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
      {sichtbar.map((e) => (
        <li key={e.label} className="flex items-center gap-1.5">
          <Skizze
            elemente={[e.el]}
            viewBox={e.viewBox ?? "0 0 28 16"}
            rahmen={false}
            className="h-4 w-7"
          />
          {e.label}
        </li>
      ))}
    </ul>
  );
}
