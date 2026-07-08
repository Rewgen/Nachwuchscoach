import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DatenProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";
import ServiceWorkerRegistrierung from "@/components/ServiceWorkerRegistrierung";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nachwuchscoach – Trainingsplanung Kinderleichtathletik",
  description:
    "Übungsdatenbank, Trainingsplanung, Trainingslog, Teilnehmerverwaltung und Sportabzeichen für Leichtathletiktrainer im Kinder- und Jugendbereich.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <DatenProvider>
          <AppShell>{children}</AppShell>
        </DatenProvider>
        <ServiceWorkerRegistrierung />
      </body>
    </html>
  );
}
