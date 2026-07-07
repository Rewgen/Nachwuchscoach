"use client";

import { Medal } from "lucide-react";
import type { Medaille } from "@/lib/sportabzeichen";
import { Badge } from "./ui";

export default function MedaillenPille({
  medaille,
  gross = false,
}: {
  medaille: Medaille | "keine" | null;
  gross?: boolean;
}) {
  if (!medaille) return null;
  const stile: Record<string, string> = {
    bronze: "border-orange-300 bg-orange-50 text-orange-800",
    silber: "border-slate-300 bg-slate-100 text-slate-600",
    gold: "border-amber-300 bg-amber-50 text-amber-700",
    keine: "border-slate-200 bg-white text-slate-400",
  };
  const text: Record<string, string> = {
    bronze: gross ? "Bronze" : "B",
    silber: gross ? "Silber" : "S",
    gold: gross ? "Gold" : "G",
    keine: "–",
  };
  return (
    <Badge className={stile[medaille]}>
      {gross && <Medal size={12} />}
      {text[medaille]}
    </Badge>
  );
}
