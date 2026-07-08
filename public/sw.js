// Nachwuchscoach Service Worker: macht die App-Oberfläche offline nutzbar.
// - Seiten (Navigationen): Netz zuerst, sonst Cache, sonst Startseite
// - Next.js-Assets (gehashte Dateien): Cache zuerst
// - Supabase-Storage-Medien (Bilder/Videos): Cache zuerst
// Die Nutzdaten selbst cached die App-Schicht (lib/offline.ts), nicht der SW.

const VERSION = "v1";
const CACHE_SEITEN = `nachwuchscoach-seiten-${VERSION}`;
const CACHE_STATISCH = `nachwuchscoach-statisch-${VERSION}`;
const CACHE_MEDIEN = `nachwuchscoach-medien-${VERSION}`;
const ALLE_CACHES = [CACHE_SEITEN, CACHE_STATISCH, CACHE_MEDIEN];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (ereignis) => {
  ereignis.waitUntil(
    (async () => {
      const namen = await caches.keys();
      await Promise.all(
        namen
          .filter((n) => n.startsWith("nachwuchscoach-") && !ALLE_CACHES.includes(n))
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (ereignis) => {
  const anfrage = ereignis.request;
  if (anfrage.method !== "GET") return;
  const url = new URL(anfrage.url);

  // Seiten-Navigationen: Netz zuerst, damit Updates ankommen.
  if (anfrage.mode === "navigate") {
    ereignis.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_SEITEN);
        try {
          const antwort = await fetch(anfrage);
          if (antwort.ok) cache.put(anfrage, antwort.clone());
          return antwort;
        } catch {
          const gecacht = await cache.match(anfrage, { ignoreSearch: true });
          if (gecacht) return gecacht;
          const start = await cache.match("/");
          return start || Response.error();
        }
      })()
    );
    return;
  }

  // Gehashte Build-Assets: unveränderlich, Cache zuerst.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    ereignis.respondWith(cacheZuerst(CACHE_STATISCH, anfrage));
    return;
  }

  // Öffentliche Supabase-Storage-Medien: Cache zuerst.
  if (url.pathname.includes("/storage/v1/object/public/")) {
    ereignis.respondWith(cacheZuerst(CACHE_MEDIEN, anfrage));
    return;
  }
});

async function cacheZuerst(cacheName, anfrage) {
  const cache = await caches.open(cacheName);
  const gecacht = await cache.match(anfrage);
  if (gecacht) return gecacht;
  try {
    const antwort = await fetch(anfrage);
    if (antwort.ok) cache.put(anfrage, antwort.clone());
    return antwort;
  } catch (fehler) {
    return Response.error();
  }
}
