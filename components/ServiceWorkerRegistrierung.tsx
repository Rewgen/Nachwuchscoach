"use client";

import { useEffect } from "react";

/** Registriert den Service Worker (nur im Produktions-Build). */
export default function ServiceWorkerRegistrierung() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((fehler) => {
      console.warn("Service Worker konnte nicht registriert werden:", fehler);
    });
  }, []);
  return null;
}
