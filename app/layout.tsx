import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeicherProvider } from "@/lib/speicher";
import Kopfzeile from "@/components/Kopfzeile";
import ServiceWorkerRegistrierung from "@/components/ServiceWorkerRegistrierung";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nachwuchscoach – Übungen für die Kinderleichtathletik",
  description:
    "Übungssammlung für Leichtathletiktrainer im Kinder- und Jugendbereich: suchen, filtern, das nächste Training zusammenstellen.",
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
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <SpeicherProvider>
          <Kopfzeile />
          <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">{children}</main>
        </SpeicherProvider>
        <ServiceWorkerRegistrierung />
      </body>
    </html>
  );
}
