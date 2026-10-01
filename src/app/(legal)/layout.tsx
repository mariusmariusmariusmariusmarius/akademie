import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-noise min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
        <Logo />
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="size-4" /> Zur Startseite
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">{children}</main>
    </div>
  );
}
