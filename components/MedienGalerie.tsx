"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Medium } from "@/lib/types";
import { mediumUrl, youtubeEmbedUrl, youtubeVorschau } from "@/lib/store";

/** Bilderserie/Videos einer Übung: großer Viewer mit Miniaturleiste. */
export default function MedienGalerie({ medien }: { medien: Medium[] }) {
  const [index, setIndex] = useState(0);
  if (medien.length === 0) return null;
  const aktiv = medien[Math.min(index, medien.length - 1)];

  return (
    <div>
      <div className="relative overflow-hidden rounded-md border border-slate-200 bg-slate-900">
        <div className="flex aspect-video items-center justify-center">
          {aktiv.typ === "bild" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediumUrl(aktiv)}
              alt={aktiv.beschriftung ?? "Übungsbild"}
              className="h-full w-full object-contain"
            />
          )}
          {aktiv.typ === "video" && (
            <video src={mediumUrl(aktiv)} controls playsInline className="h-full w-full" />
          )}
          {aktiv.typ === "youtube" && aktiv.url && (
            <iframe
              src={youtubeEmbedUrl(aktiv.url) ?? undefined}
              title={aktiv.beschriftung ?? "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          )}
        </div>
        {medien.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((index - 1 + medien.length) % medien.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
              aria-label="Vorheriges Medium"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIndex((index + 1) % medien.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
              aria-label="Nächstes Medium"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      {aktiv.beschriftung && (
        <p className="mt-1.5 text-center text-xs text-slate-500">{aktiv.beschriftung}</p>
      )}
      {medien.length > 1 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {medien.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded border transition-colors ${
                i === index ? "border-sky-600 ring-2 ring-sky-100" : "border-slate-200"
              }`}
              title={m.beschriftung}
            >
              <MediumMiniatur medium={m} />
              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[9px] font-medium text-white">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Kleines Vorschaubild eines Mediums (auch für Karten/Listen nutzbar). */
export function MediumMiniatur({ medium }: { medium: Medium }) {
  if (medium.typ === "bild") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={mediumUrl(medium)}
        alt={medium.beschriftung ?? ""}
        className="h-full w-full object-cover"
      />
    );
  }
  if (medium.typ === "youtube" && medium.url) {
    const bild = youtubeVorschau(medium.url);
    return (
      <span className="relative block h-full w-full">
        {bild ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bild} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="block h-full w-full bg-slate-200" />
        )}
        <Play
          size={16}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow"
          fill="currentColor"
        />
      </span>
    );
  }
  return (
    <span className="relative block h-full w-full bg-slate-800">
      <video
        src={mediumUrl(medium)}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
      <Play
        size={16}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow"
        fill="currentColor"
      />
    </span>
  );
}
