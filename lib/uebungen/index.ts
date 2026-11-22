import type { Uebung } from "../types";
import { AUFWAERMEN } from "./aufwaermen";
import { AUSDAUER, KOORDINATION, KRAEFTIGUNG } from "./ausdauer-koordination";
import { SPRINT } from "./sprint";
import { ABSCHLUSS, STAFFELN } from "./staffeln-abschluss";
import { SPRUNG, WURF } from "./sprung-wurf";

export const UEBUNGEN: Uebung[] = [
  ...AUFWAERMEN,
  ...SPRINT,
  ...SPRUNG,
  ...WURF,
  ...AUSDAUER,
  ...KOORDINATION,
  ...KRAEFTIGUNG,
  ...STAFFELN,
  ...ABSCHLUSS,
];

const NACH_ID = new Map(UEBUNGEN.map((u) => [u.id, u]));

export function uebungNachId(id: string): Uebung | undefined {
  return NACH_ID.get(id);
}
