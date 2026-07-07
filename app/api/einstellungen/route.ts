import { NextResponse } from "next/server";
import { einstellungenRepo } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { key, wert } = (await req.json()) as { key: string; wert: unknown };
  if (!key) {
    return NextResponse.json({ fehler: "key fehlt" }, { status: 400 });
  }
  einstellungenRepo.setzen(key, wert);
  return NextResponse.json({ ok: true });
}
