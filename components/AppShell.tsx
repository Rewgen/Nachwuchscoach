"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  CalendarPlus,
  ClipboardList,
  Database,
  Dumbbell,
  LayoutDashboard,
  ListChecks,
  Medal,
  Menu,
  PencilRuler,
  Timer,
  Users,
} from "lucide-react";
import { useDaten } from "@/lib/store";

const BEREICHE: {
  label: string | null;
  links: { href: string; label: string; icon: typeof Dumbbell }[];
}[] = [
  {
    label: null,
    links: [{ href: "/", label: "Übersicht", icon: LayoutDashboard }],
  },
  {
    label: "Training",
    links: [
      { href: "/uebungen", label: "Übungen", icon: Dumbbell },
      { href: "/planen", label: "Training planen", icon: CalendarPlus },
      { href: "/trainings", label: "Meine Trainings", icon: ClipboardList },
      { href: "/hallenplaner", label: "Hallen- & Platzplaner", icon: PencilRuler },
    ],
  },
  {
    label: "Athleten",
    links: [
      { href: "/teilnehmer", label: "Teilnehmer", icon: Users },
      { href: "/sportabzeichen", label: "Sportabzeichen", icon: Medal },
      { href: "/stoppuhr", label: "Stoppuhr", icon: Timer },
    ],
  },
  {
    label: "Organisation",
    links: [
      { href: "/checklisten", label: "Checklisten", icon: ListChecks },
      { href: "/daten", label: "Daten & Einstellungen", icon: Database },
    ],
  },
];

const MOBIL_LINKS = [
  { href: "/", label: "Start", icon: LayoutDashboard },
  { href: "/uebungen", label: "Übungen", icon: Dumbbell },
  { href: "/planen", label: "Planen", icon: CalendarPlus },
  { href: "/trainings", label: "Trainings", icon: ClipboardList },
  { href: "/mehr", label: "Mehr", icon: Menu },
];

function istAktiv(pfad: string, href: string): boolean {
  if (href === "/") return pfad === "/";
  return pfad === href || pfad.startsWith(href + "/") || pfad.startsWith(href + "?");
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pfad = usePathname();
  const { entwurf, bereit } = useDaten();
  const merklisteAnzahl = bereit ? entwurf.length : 0;

  return (
    <div className="flex min-h-screen">
      {/* Seitenleiste (Desktop) */}
      <aside className="print-verbergen fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-700 text-white">
            <Activity size={17} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">Nachwuchscoach</span>
            <span className="block text-[11px] text-slate-500">Leichtathletik</span>
          </span>
        </Link>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {BEREICHE.map((bereich, i) => (
            <div key={i} className={i > 0 ? "mt-5" : ""}>
              {bereich.label && (
                <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {bereich.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {bereich.links.map((l) => {
                  const aktiv = istAktiv(pfad, l.href);
                  const Icon = l.icon;
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                          aktiv
                            ? "bg-sky-50 font-medium text-sky-900"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon size={16} className={aktiv ? "text-sky-700" : "text-slate-400"} />
                        <span className="flex-1">{l.label}</span>
                        {l.href === "/planen" && merklisteAnzahl > 0 && (
                          <span className="rounded-full bg-sky-700 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                            {merklisteAnzahl}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <p className="border-t border-slate-200 px-4 py-3 text-[11px] text-slate-400">
          Lokale Version · Daten in ./daten
        </p>
      </aside>

      {/* Kopfzeile (Mobil) */}
      <header className="print-verbergen fixed inset-x-0 top-0 z-40 flex items-center gap-2.5 border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-700 text-white">
          <Activity size={15} />
        </span>
        <span className="text-sm font-semibold text-slate-900">Nachwuchscoach</span>
      </header>

      {/* Inhalt */}
      <main className="min-w-0 flex-1 px-4 pb-24 pt-16 sm:px-6 lg:ml-60 lg:pb-10 lg:pt-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Tab-Leiste (Mobil) */}
      <nav className="print-verbergen fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white lg:hidden">
        {MOBIL_LINKS.map((l) => {
          const aktiv =
            l.href === "/mehr"
              ? [
                  "/teilnehmer",
                  "/sportabzeichen",
                  "/stoppuhr",
                  "/checklisten",
                  "/daten",
                  "/mehr",
                  "/hallenplaner",
                ].some((p) => istAktiv(pfad, p))
              : istAktiv(pfad, l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                aktiv ? "text-sky-700" : "text-slate-500"
              }`}
            >
              <Icon size={19} />
              {l.label}
              {l.href === "/planen" && merklisteAnzahl > 0 && (
                <span className="absolute right-1/2 top-0.5 -mr-6 rounded-full bg-sky-700 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
                  {merklisteAnzahl}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
