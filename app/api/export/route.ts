import { NextResponse } from "next/server";
import { gesamtDaten } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const datum = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(gesamtDaten(), null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="nachwuchscoach-sicherung-${datum}.json"`,
    },
  });
}
