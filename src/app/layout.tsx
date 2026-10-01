import type { Metadata } from "next";
import { PLATTFORM_URL } from "@/lib/config";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Zaehler from "@/components/Zaehler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(PLATTFORM_URL),
  title: {
    default: "gefundenwerden.online Academy — Websites bauen. Business starten.",
    template: "%s · gefundenwerden.online Academy",
  },
  description:
    "Die Lernplattform von gefundenwerden.online: Eigene Websites, Shops und digitale Tools selbst bauen — von der Domain bis zur eigenen Admin-App. Kurse, Community und Praxis-Cases.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Zaehler />
      </body>
    </html>
  );
}
