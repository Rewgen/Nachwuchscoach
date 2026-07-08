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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Nachwuchscoach",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0369a1",
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
