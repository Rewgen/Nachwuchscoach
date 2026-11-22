"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutGrid } from "lucide-react";
import { useSpeicher } from "@/lib/speicher";

export default function Kopfzeile() {
  const pfad = usePathname();
  const { merkliste, bereit } = useSpeicher();
  const anzahl = bereit ? merkliste.length : 0;
  const imKatalog = pfad === "/" || pfad.startsWith("/uebung");

  return (
    <>
    <header className="print-verbergen sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight text-slate-900">
              Nachwuchscoach
            </span>
            <span className="hidden text-xs text-slate-500 sm:block">
              Übungen für die Kinderleichtathletik
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink href="/" aktiv={imKatalog}>
            <LayoutGrid className="h-4 w-4" />
            Übungen
          </NavLink>
          <NavLink href="/training" aktiv={pfad.startsWith("/training")}>
            <ClipboardList className="h-4 w-4" />
            Training planen
            {anzahl > 0 && (
              <span className="ml-0.5 rounded-full bg-sky-700 px-1.5 py-px text-[11px] font-semibold text-white tabular">
                {anzahl}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
      <nav className="print-verbergen fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
        <TabLink href="/" aktiv={imKatalog}>
          <LayoutGrid className="h-5 w-5" />
          Übungen
        </TabLink>
        <TabLink href="/training" aktiv={pfad.startsWith("/training")}>
          <span className="relative">
            <ClipboardList className="h-5 w-5" />
            {anzahl > 0 && (
              <span className="absolute -right-2.5 -top-1.5 rounded-full bg-sky-700 px-1.5 text-[10px] font-semibold leading-4 text-white tabular">
                {anzahl}
              </span>
            )}
          </span>
          Training
        </TabLink>
      </nav>
    </>
  );
}

function TabLink({
  href,
  aktiv,
  children,
}: {
  href: string;
  aktiv: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
        aktiv ? "text-sky-700" : "text-slate-500"
      }`}
    >
      {children}
    </Link>
  );
}

function NavLink({
  href,
  aktiv,
  children,
}: {
  href: string;
  aktiv: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        aktiv ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <rect width="32" height="32" rx="7" fill="#0369a1" />
      <path d="M7 22 C 11 22, 12 10, 16 10 S 21 22, 25 22" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="10" r="2.6" fill="#fcd34d" />
    </svg>
  );
}
