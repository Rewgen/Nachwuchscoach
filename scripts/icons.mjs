// Einmaliges Generieren der App-Icons (PWA/Android-Installation).
// Aufruf:  npm i --no-save sharp && node scripts/icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

// Aktivitäts-Puls (wie das App-Logo) auf Eisblau.
function svg({ groesse, radius, glyphSkalierung }) {
  const g = groesse;
  const mitte = g / 2;
  const s = (g / 512) * glyphSkalierung;
  return Buffer.from(`<svg width="${g}" height="${g}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${g}" height="${g}" rx="${radius}" fill="#0369a1"/>
    <g transform="translate(${mitte} ${mitte}) scale(${s}) translate(-256 -256)">
      <path d="M96 256h80l48-128 64 256 48-128h80"
        stroke="#ffffff" stroke-width="42" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`);
}

mkdirSync("public", { recursive: true });

// Normale Icons: abgerundete Ecken einbacken.
await sharp(svg({ groesse: 512, radius: 100, glyphSkalierung: 1 }))
  .png()
  .toFile("public/icon-512.png");
await sharp(svg({ groesse: 192, radius: 38, glyphSkalierung: 1 }))
  .png()
  .toFile("public/icon-192.png");

// Maskable: vollflächiger Hintergrund, Glyphe in der sicheren Zone (80 %).
await sharp(svg({ groesse: 512, radius: 0, glyphSkalierung: 0.72 }))
  .png()
  .toFile("public/icon-maskable-512.png");

// Apple Touch Icon (iOS rundet selbst ab).
await sharp(svg({ groesse: 180, radius: 0, glyphSkalierung: 0.85 }))
  .png()
  .toFile("public/apple-touch-icon.png");

console.log("Icons erzeugt: icon-192, icon-512, icon-maskable-512, apple-touch-icon");
