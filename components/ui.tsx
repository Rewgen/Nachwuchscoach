import { Heart, Plus, Check } from "lucide-react";
import type { Intensitaet, Schwerpunkt } from "@/lib/types";
import { label, schwerpunktFarbe } from "@/lib/katalog";

export function SchwerpunktMarke({ s }: { s: Schwerpunkt }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <span className={`h-2 w-2 rounded-full ${schwerpunktFarbe(s)}`} />
      {label.schwerpunkt(s)}
    </span>
  );
}

export function IntensitaetBalken({ wert }: { wert: Intensitaet }) {
  return (
    <span className="inline-flex items-end gap-0.5" aria-label={`Intensität ${wert} von 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${i <= wert ? "bg-slate-700" : "bg-slate-200"}`}
          style={{ height: 4 + i * 3 }}
        />
      ))}
    </span>
  );
}

export function FavoritKnopf({
  aktiv,
  onClick,
  gross = false,
}: {
  aktiv: boolean;
  onClick: () => void;
  gross?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      title={aktiv ? "Aus Favoriten entfernen" : "Als Favorit merken"}
      className={`inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors ${
        gross ? "h-10 px-3.5" : "h-8 w-8"
      } ${
        aktiv
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
      }`}
    >
      <Heart className="h-4 w-4" fill={aktiv ? "currentColor" : "none"} />
      {gross && (aktiv ? "Favorit" : "Merken")}
    </button>
  );
}

export function TrainingKnopf({
  aktiv,
  onClick,
  gross = false,
}: {
  aktiv: boolean;
  onClick: () => void;
  gross?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      title={aktiv ? "Aus dem Training entfernen" : "Zum nächsten Training hinzufügen"}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors ${
        gross ? "h-10 px-4" : "h-8 px-2.5"
      } ${
        aktiv
          ? "border border-sky-200 bg-sky-50 text-sky-800"
          : "bg-sky-700 text-white hover:bg-sky-800"
      }`}
    >
      {aktiv ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {gross ? (aktiv ? "Im Training" : "Zum Training") : aktiv ? "Geplant" : "Training"}
    </button>
  );
}

export function Chip({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors ${
        aktiv
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}
