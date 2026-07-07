// Wettervorhersage über Open-Meteo (kostenlos, ohne API-Schlüssel).

export interface WetterTag {
  datum: string;
  code: number;
  tempMax: number;
  tempMin: number;
  regenWahrscheinlichkeit: number;
  windMax: number;
}

export interface GeoTreffer {
  name: string;
  land: string;
  verwaltung?: string;
  lat: number;
  lon: number;
}

/** Ortssuche für die Einstellungen. */
export async function orteSuchen(name: string): Promise<GeoTreffer[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name
  )}&count=5&language=de&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as {
    results?: {
      name: string;
      country: string;
      admin1?: string;
      latitude: number;
      longitude: number;
    }[];
  };
  return (json.results ?? []).map((r) => ({
    name: r.name,
    land: r.country,
    verwaltung: r.admin1,
    lat: r.latitude,
    lon: r.longitude,
  }));
}

/** Tagesvorhersage für ein Datum (bis ca. 16 Tage im Voraus), sonst null. */
export async function wetterFuerTag(
  lat: number,
  lon: number,
  datum: string
): Promise<WetterTag | null> {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const ziel = new Date(datum + "T00:00:00");
  const diffTage = Math.round((ziel.getTime() - heute.getTime()) / 86400000);
  if (diffTage < 0 || diffTage > 15) return null;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=auto&start_date=${datum}&end_date=${datum}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    daily?: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: (number | null)[];
      wind_speed_10m_max: number[];
    };
  };
  const d = json.daily;
  if (!d || d.time.length === 0) return null;
  return {
    datum: d.time[0],
    code: d.weather_code[0],
    tempMax: Math.round(d.temperature_2m_max[0]),
    tempMin: Math.round(d.temperature_2m_min[0]),
    regenWahrscheinlichkeit: d.precipitation_probability_max[0] ?? 0,
    windMax: Math.round(d.wind_speed_10m_max[0]),
  };
}

/** WMO-Wettercode → Beschreibung + Icon-Gruppe. */
export function wetterBeschreibung(code: number): {
  text: string;
  icon: "sonne" | "wolke-sonne" | "wolke" | "nebel" | "regen" | "schnee" | "gewitter";
} {
  if (code === 0) return { text: "Klar", icon: "sonne" };
  if (code <= 2) return { text: "Leicht bewölkt", icon: "wolke-sonne" };
  if (code === 3) return { text: "Bedeckt", icon: "wolke" };
  if (code <= 48) return { text: "Nebel", icon: "nebel" };
  if (code <= 57) return { text: "Nieselregen", icon: "regen" };
  if (code <= 67) return { text: "Regen", icon: "regen" };
  if (code <= 77) return { text: "Schnee", icon: "schnee" };
  if (code <= 82) return { text: "Regenschauer", icon: "regen" };
  if (code <= 86) return { text: "Schneeschauer", icon: "schnee" };
  return { text: "Gewitter", icon: "gewitter" };
}
