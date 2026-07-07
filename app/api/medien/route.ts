import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { medienRepo, UPLOAD_DIR } from "@/lib/server/db";
import type { Medium } from "@/lib/types";

export const dynamic = "force-dynamic";

const ERLAUBTE_ENDUNGEN: Record<string, "bild" | "video"> = {
  ".jpg": "bild",
  ".jpeg": "bild",
  ".png": "bild",
  ".webp": "bild",
  ".gif": "bild",
  ".avif": "bild",
  ".mp4": "video",
  ".webm": "video",
  ".mov": "video",
  ".m4v": "video",
};

/**
 * POST multipart/form-data: Datei-Upload (Felder: datei, uebungId, beschriftung?)
 * POST application/json:   YouTube-Link oder Metadaten-Update eines Mediums
 */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const datei = form.get("datei");
    const uebungId = String(form.get("uebungId") ?? "");
    if (!(datei instanceof File) || !uebungId) {
      return NextResponse.json({ fehler: "datei/uebungId fehlt" }, { status: 400 });
    }
    const endung = path.extname(datei.name).toLowerCase();
    const typ = ERLAUBTE_ENDUNGEN[endung];
    if (!typ) {
      return NextResponse.json(
        { fehler: `Dateityp ${endung || "(ohne Endung)"} wird nicht unterstützt.` },
        { status: 400 }
      );
    }
    const dateiname = `${crypto.randomUUID()}${endung}`;
    const puffer = Buffer.from(await datei.arrayBuffer());
    fs.writeFileSync(path.join(UPLOAD_DIR, dateiname), puffer);

    const medium: Medium = {
      id: crypto.randomUUID(),
      uebungId,
      typ,
      dateiname,
      beschriftung: String(form.get("beschriftung") ?? "") || undefined,
      reihenfolge: Number(form.get("reihenfolge") ?? 0),
    };
    medienRepo.speichern(medium);
    return NextResponse.json(medium);
  }

  // JSON: YouTube-Link anlegen oder bestehendes Medium aktualisieren.
  const body = (await req.json()) as Medium;
  if (!body?.id || !body?.uebungId) {
    return NextResponse.json({ fehler: "id/uebungId fehlt" }, { status: 400 });
  }
  // Dateiname darf nur über den Upload gesetzt werden – vorhandenen Wert schützen.
  const bestehend = medienRepo.holen(body.id);
  medienRepo.speichern({ ...body, dateiname: bestehend?.dateiname ?? body.dateiname });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ fehler: "id fehlt" }, { status: 400 });
  }
  medienRepo.loeschen(id);
  return NextResponse.json({ ok: true });
}
