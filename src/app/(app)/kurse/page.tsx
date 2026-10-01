import Link from "next/link";
import { ArrowRight, BookOpen, Lock } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasAccess } from "@/lib/tiers";
import { SICHTBARE_MODULE } from "@/lib/data/curriculum";
import { DataIcon } from "@/components/icon-map";
import { TierBadge } from "@/components/ui/tier-badge";

export const metadata = { title: "Kurse" };

export default async function CoursesPage() {
  const session = (await getSession())!;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Kurse</h1>
        <p className="mt-2 text-zinc-400">
          Dein Weg von der ersten Domain bis zur eigenen Admin-App — Modul für Modul.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {SICHTBARE_MODULE.map((mod, i) => {
          const unlocked = hasAccess(session.tier, mod.tier);
          return (
            <Link
              key={mod.slug}
              href={`/kurse/${mod.slug}`}
              className={`group relative overflow-hidden rounded-3xl border p-7 transition ${
                unlocked
                  ? "border-white/8 bg-surface-900/70 hover:-translate-y-0.5 hover:border-white/15"
                  : "border-white/5 bg-surface-900/40"
              }`}
            >
              {/* Eckenschein: radial ausgeblendet statt geblurrt — sonst sieht man die Kreiskante */}
              <div className={`pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gradient-to-br [mask-image:radial-gradient(closest-side,black,transparent)] transition-opacity duration-300 ${mod.gradient} ${unlocked ? "opacity-25 group-hover:opacity-45" : "opacity-10"}`} />
              <div className="mb-5 flex items-start justify-between">
                <span className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white ${mod.gradient} ${unlocked ? "" : "opacity-40 grayscale"}`}>
                  <DataIcon name={mod.icon} className="size-6" />
                </span>
                <TierBadge tier={mod.tier} locked={!unlocked} />
              </div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Modul {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className={`mb-2 text-xl font-semibold ${unlocked ? "text-white" : "text-zinc-400"}`}>
                {mod.title}
              </h2>
              <p className="mb-5 text-sm leading-relaxed text-zinc-400">{mod.subtitle}</p>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs text-zinc-500">
                  <BookOpen className="size-3.5" />
                  {mod.lessons.length} Lektionen ·{" "}
                  {mod.lessons.reduce((sum, lesson) => sum + lesson.duration, 0)} Min.
                </p>
                {unlocked ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-brand-300">
                    Öffnen <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <Lock className="size-3.5" /> Gesperrt
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
