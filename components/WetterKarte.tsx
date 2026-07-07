"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from "lucide-react";
import { useDaten } from "@/lib/store";
import { wetterBeschreibung, wetterFuerTag, type WetterTag } from "@/lib/wetter";
import type { WetterOrt } from "@/lib/types";

const ICONS = {
  sonne: Sun,
  "wolke-sonne": CloudSun,
  wolke: Cloud,
  nebel: CloudFog,
  regen: CloudRain,
  schnee: CloudSnow,
  gewitter: CloudLightning,
};

// Einfacher Cache, damit dieselbe Abfrage nicht mehrfach läuft.
const cache = new Map<string, Promise<WetterTag | null>>();

/** Wettervorhersage für ein Trainingsdatum (nur wenn ein Ort eingestellt ist). */
export default function WetterKarte({ datum }: { datum: string }) {
  const { daten, bereit } = useDaten();
  const ort = daten.einstellungen["wetter-ort"] as WetterOrt | undefined;
  const [wetter, setWetter] = useState<WetterTag | null>(null);

  useEffect(() => {
    if (!bereit || !ort) return;
    const key = `${ort.lat},${ort.lon},${datum}`;
    if (!cache.has(key)) cache.set(key, wetterFuerTag(ort.lat, ort.lon, datum));
    let aktiv = true;
    void cache.get(key)!.then((w) => {
      if (aktiv) setWetter(w);
    });
    return () => {
      aktiv = false;
    };
  }, [bereit, ort, datum]);

  if (!ort || !wetter) return null;

  const info = wetterBeschreibung(wetter.code);
  const Icon = ICONS[info.icon];

  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
      <Icon size={22} className="shrink-0 text-sky-700" />
      <div className="leading-tight">
        <p className="font-medium text-slate-800">
          {info.text}, {wetter.tempMin}–{wetter.tempMax} °C
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-0.5">
            <Droplets size={11} />
            {wetter.regenWahrscheinlichkeit} %
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Wind size={11} />
            {wetter.windMax} km/h
          </span>
          <span>{ort.name}</span>
        </p>
      </div>
    </div>
  );
}
