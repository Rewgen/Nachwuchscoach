import { NextResponse } from "next/server";
import { gesamtDaten, importieren } from "@/lib/server/db";
import type { AppDaten } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    daten: Partial<AppDaten>;
    modus?: "ersetzen" | "zusammenfuehren";
  };
  if (!body?.daten || typeof body.daten !== "object") {
    return NextResponse.json({ fehler: "Keine Daten übergeben." }, { status: 400 });
  }
  importieren(body.daten, body.modus ?? "zusammenfuehren");
  return NextResponse.json(gesamtDaten());
}
