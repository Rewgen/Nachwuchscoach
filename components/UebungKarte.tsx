"use client";

import Link from "next/link";
import { Clock, Package, Users } from "lucide-react";
import type { Uebung } from "@/lib/types";
import { alterText, label } from "@/lib/katalog";
import { useSpeicher } from "@/lib/speicher";
import Skizze from "./Skizze";
import { FavoritKnopf, SchwerpunktMarke, TrainingKnopf } from "./ui";

export default function UebungKarte({ u }: { u: Uebung }) {
  const { favoriten, favoritUmschalten, aufMerkliste, merkUmschalten } = useSpeicher();

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-[0_2px_12px_-4px_rgba(15,23,42,0.12)]">
      <Link href={`/uebung?id=${u.id}`} className="flex flex-1 flex-col">
        <div className="border-b border-slate-100 p-2.5">
          <Skizze elemente={u.skizze} titel={u.titel} className="block h-auto w-full" />
        </div>
        <div className="flex flex-1 flex-col px-4 pb-3 pt-3">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {label.stundenteil(u.stundenteil)}
            </span>
            {u.schwerpunkte.slice(0, 2).map((s) => (
              <SchwerpunktMarke key={s} s={s} />
            ))}
          </div>
          <h3 className="font-semibold tracking-tight text-slate-900 group-hover:text-sky-800">
            {u.titel}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{u.kurz}</p>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3 whitespace-nowrap text-xs text-slate-500 tabular">
          <span className="inline-flex items-center gap-1" title="Dauer">
            <Clock className="h-3.5 w-3.5" />
            {u.dauer} min
          </span>
          <span className="inline-flex items-center gap-1" title="Alter">
            <Users className="h-3.5 w-3.5" />
            {alterText(u)}
          </span>
          <span
            className="hidden items-center gap-1 sm:inline-flex"
            title={u.material.length ? u.material.join(", ") : "Ohne Material"}
          >
            <Package className="h-3.5 w-3.5" />
            {u.material.length === 0 ? "ohne" : u.material.length}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <FavoritKnopf aktiv={favoriten.has(u.id)} onClick={() => favoritUmschalten(u.id)} />
          <TrainingKnopf aktiv={aufMerkliste(u.id)} onClick={() => merkUmschalten(u.id)} />
        </div>
      </div>
    </article>
  );
}
