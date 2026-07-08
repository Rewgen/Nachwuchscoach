import { NextResponse } from "next/server";
import { gesamtDaten } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(gesamtDaten());
}
