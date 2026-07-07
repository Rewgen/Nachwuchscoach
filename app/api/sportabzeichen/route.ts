import { NextResponse } from "next/server";
import { sportabzeichenRepo } from "@/lib/server/db";
import type { SportabzeichenEintrag } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as SportabzeichenEintrag;
  if (!body?.jahr || !body?.teilnehmerId) {
    return NextResponse.json({ fehler: "jahr/teilnehmerId fehlt" }, { status: 400 });
  }
  sportabzeichenRepo.speichern(body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const params = new URL(req.url).searchParams;
  const jahr = parseInt(params.get("jahr") ?? "", 10);
  const teilnehmerId = params.get("teilnehmerId");
  if (!jahr || !teilnehmerId) {
    return NextResponse.json({ fehler: "jahr/teilnehmerId fehlt" }, { status: 400 });
  }
  sportabzeichenRepo.loeschen(jahr, teilnehmerId);
  return NextResponse.json({ ok: true });
}
