import { NextResponse } from "next/server";

/** Standard-POST/DELETE für Entitäten mit id (lokale Ein-Nutzer-App, minimale Validierung). */
export function entityRoute<T extends { id: string }>(repo: {
  speichern: (x: T) => void;
  loeschen: (id: string) => void;
}) {
  return {
    POST: async (req: Request) => {
      const body = (await req.json()) as T;
      if (!body?.id) {
        return NextResponse.json({ fehler: "id fehlt" }, { status: 400 });
      }
      repo.speichern(body);
      return NextResponse.json({ ok: true });
    },
    DELETE: async (req: Request) => {
      const id = new URL(req.url).searchParams.get("id");
      if (!id) {
        return NextResponse.json({ fehler: "id fehlt" }, { status: 400 });
      }
      repo.loeschen(id);
      return NextResponse.json({ ok: true });
    },
  };
}
