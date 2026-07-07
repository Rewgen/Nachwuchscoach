import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  // basename verhindert Pfad-Ausbrüche aus dem Upload-Ordner.
  const sicher = path.basename(name);
  const pfad = path.join(UPLOAD_DIR, sicher);
  if (!fs.existsSync(pfad)) {
    return new Response("Nicht gefunden", { status: 404 });
  }
  const daten = fs.readFileSync(pfad);
  const mime = MIME[path.extname(sicher).toLowerCase()] ?? "application/octet-stream";
  return new Response(new Uint8Array(daten), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
