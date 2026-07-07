"use client";

import type { ReactNode } from "react";
import { Minus, Star, ThumbsDown, ThumbsUp, X } from "lucide-react";
import type { Abschnitt, UebungsBewertung } from "@/lib/types";
import { ABSCHNITT_FARBEN, abschnittLabel } from "@/lib/labels";

// ===== Klassen-Bausteine (ein Ort für den Look der App) =====

export const eingabeKlasse =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-sky-600 focus:ring-2 focus:ring-sky-100";

export const primaerKnopf =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-sky-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-40";

export const sekundaerKnopf =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900";

export const gefahrKnopf =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50";

export const leiseKnopf =
  "inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800";

export const karteKlasse = "rounded-lg border border-slate-200 bg-white";

// ===== Kleinbausteine =====

export function Badge({
  children,
  className = "border-slate-200 bg-slate-50 text-slate-600",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function AbschnittBadge({ abschnitt }: { abschnitt: Abschnitt }) {
  return <Badge className={ABSCHNITT_FARBEN[abschnitt]}>{abschnittLabel(abschnitt)}</Badge>;
}

export function MaterialBadges({ material }: { material: string[] }) {
  if (material.length === 0) {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
        ohne Material
      </Badge>
    );
  }
  return (
    <>
      {material.map((m) => (
        <Badge key={m}>{m}</Badge>
      ))}
    </>
  );
}

export function BewertungsSymbol({
  bewertung,
  groesse = 14,
}: {
  bewertung?: UebungsBewertung;
  groesse?: number;
}) {
  if (bewertung === "gut")
    return <ThumbsUp size={groesse} className="inline text-emerald-600" aria-label="Lief gut" />;
  if (bewertung === "mittel")
    return <Minus size={groesse} className="inline text-amber-500" aria-label="Ging so" />;
  if (bewertung === "schlecht")
    return <ThumbsDown size={groesse} className="inline text-red-500" aria-label="Lief nicht" />;
  return null;
}

export function FavoritStern({
  aktiv,
  onClick,
}: {
  aktiv: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={aktiv ? "Favorit entfernen" : "Als Favorit markieren"}
      className={`rounded-md p-1.5 transition-colors hover:bg-slate-100 ${
        aktiv ? "text-amber-500" : "text-slate-300 hover:text-amber-500"
      }`}
    >
      <Star size={16} fill={aktiv ? "currentColor" : "none"} />
    </button>
  );
}

export function SeitenKopf({
  titel,
  beschreibung,
  aktionen,
}: {
  titel: string;
  beschreibung?: string;
  aktionen?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{titel}</h1>
        {beschreibung && <p className="mt-0.5 text-sm text-slate-500">{beschreibung}</p>}
      </div>
      {aktionen && <div className="flex flex-wrap items-center gap-2">{aktionen}</div>}
    </div>
  );
}

export function LeererHinweis({
  titel,
  text,
  children,
}: {
  titel: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="font-medium text-slate-700">{titel}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p>
      {children && <div className="mt-4 flex justify-center gap-2">{children}</div>}
    </div>
  );
}

export function Feld({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

/** Überlagernder Dialog (Detailansichten, Formulare). */
export function Dialog({
  offen,
  onSchliessen,
  titel,
  breite = "max-w-2xl",
  children,
}: {
  offen: boolean;
  onSchliessen: () => void;
  titel?: string;
  breite?: string;
  children: ReactNode;
}) {
  if (!offen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:py-10"
      onClick={onSchliessen}
    >
      <div
        className={`w-full ${breite} rounded-lg border border-slate-200 bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {titel && (
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h2 className="text-base font-semibold text-slate-900">{titel}</h2>
            <button
              type="button"
              onClick={onSchliessen}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Schließen"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
