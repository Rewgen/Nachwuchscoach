"use client";

import Link from "next/link";
import {
  ChevronRight,
  Database,
  ListChecks,
  Medal,
  PencilRuler,
  Timer,
  Users,
} from "lucide-react";
import { SeitenKopf } from "@/components/ui";

const LINKS = [
  {
    href: "/hallenplaner",
    label: "Hallen- & Platzplaner",
    text: "Aufbauten auf Halle, Tartanplatz oder 400m-Bahn planen",
    icon: PencilRuler,
  },
  {
    href: "/teilnehmer",
    label: "Teilnehmer",
    text: "Kinder verwalten, Leistungen und Geburtstage",
    icon: Users,
  },
  {
    href: "/sportabzeichen",
    label: "Sportabzeichen",
    text: "Ergebnisse, Laufzettel und Abnahmelisten",
    icon: Medal,
  },
  {
    href: "/stoppuhr",
    label: "Stoppuhr",
    text: "Zeiten für mehrere Kinder gleichzeitig stoppen",
    icon: Timer,
  },
  {
    href: "/checklisten",
    label: "Checklisten",
    text: "Material und Aufgaben abhaken",
    icon: ListChecks,
  },
  {
    href: "/daten",
    label: "Daten & Einstellungen",
    text: "Sicherung, Import, Wetter-Ort",
    icon: Database,
  },
];

export default function MehrSeite() {
  return (
    <div className="mx-auto max-w-lg">
      <SeitenKopf titel="Mehr" />
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {LINKS.map((l, i) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 ${
                i > 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                <Icon size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-slate-900">{l.label}</span>
                <span className="block text-xs text-slate-500">{l.text}</span>
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
