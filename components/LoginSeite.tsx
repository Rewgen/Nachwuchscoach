"use client";

import { Activity, TriangleAlert } from "lucide-react";
import { useDaten } from "@/lib/store";

/** Vollbild-Anmeldung (wird gezeigt, solange kein Nutzer angemeldet ist). */
export default function LoginSeite() {
  const { anmeldenMitGoogle, konfigFehlt } = useDaten();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-sky-700 text-white">
          <Activity size={24} />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
          Nachwuchscoach
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Trainingsplanung für die Kinderleichtathletik – deine Daten, auf allen Geräten.
        </p>

        {konfigFehlt ? (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-left">
            <p className="flex items-center gap-1.5 text-sm font-medium text-amber-900">
              <TriangleAlert size={15} />
              Supabase nicht konfiguriert
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              Lege eine <code>.env.local</code> mit{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> an (Vorlage:{" "}
              <code>.env.local.beispiel</code>) und starte den Server neu.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={anmeldenMitGoogle}
              className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <GoogleLogo />
              Mit Google anmelden
            </button>
            <p className="mt-4 text-xs text-slate-400">
              Beim ersten Login wird dein Konto automatisch angelegt – inklusive des
              Übungs-Startbestands.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
