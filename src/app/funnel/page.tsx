import Link from "next/link";
import { Logo } from "@/components/logo";
import { DriftBlob } from "@/components/motion-primitives";
import { FunnelFlow } from "@/components/funnel/funnel-flow";

export const metadata = {
  alternates: { canonical: "/funnel" },
  title: "Welcher Website-Typ bist du? — Kostenloser Check",
  description:
    "5 Fragen, 60 Sekunden: Finde heraus, wie du deine eigene Website ohne Baukasten baust — mit deinem persönlichen Fahrplan.",
};

/**
 * Quiz-Funnel für Link-in-Bio & Ads: mobile-first, ohne Ablenkung.
 * Bewusst keine Navigation — nur Quiz, Ergebnis und ein CTA.
 */
export default function FunnelPage() {
  return (
    <div className="bg-noise relative flex min-h-screen flex-col overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <DriftBlob
          className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[130px]"
          duration={20}
          dx={60}
          dy={35}
        />
        <DriftBlob
          className="absolute bottom-10 right-[8%] h-64 w-64 rounded-full bg-accent-500/10 blur-[100px]"
          duration={16}
          dx={-45}
          dy={40}
        />
      </div>

      <header className="relative flex justify-center pt-8">
        <Logo />
      </header>

      <main className="relative flex-1">
        <FunnelFlow />
      </main>

      <footer className="relative flex items-center justify-center gap-5 pb-8 text-xs text-zinc-600">
        <Link href="/impressum" className="transition hover:text-zinc-400">Impressum</Link>
        <Link href="/datenschutz" className="transition hover:text-zinc-400">Datenschutz</Link>
        <span>© 2026 <a href="https://gefundenwerden.online" className="transition hover:text-zinc-400">gefundenwerden.online</a></span>
      </footer>
    </div>
  );
}
