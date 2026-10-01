import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Clock, FileText, Lock, Play, Presentation, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasAccess, TIER_INFO } from "@/lib/tiers";
import { getModule, modulSichtbar } from "@/lib/data/curriculum";
import { DataIcon } from "@/components/icon-map";
import { TierBadge } from "@/components/ui/tier-badge";

const KIND_ICON = { video: Play, text: FileText, case: Presentation } as const;
const KIND_LABEL = { video: "Video", text: "Artikel", case: "Praxis-Case" } as const;

export default async function ModulePage({
  params,
}: {
  params: Promise<{ modul: string }>;
}) {
  const { modul } = await params;
  const courseModule = getModule(modul);
  if (!courseModule) notFound();

  const session = (await getSession())!;
  // Module in Planung existieren für Teilnehmer nicht.
  if (!modulSichtbar(courseModule, session.role)) notFound();
  const unlocked = hasAccess(session.tier, courseModule.tier);

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm" aria-label="Pfad">
        <Link href="/kurse" className="text-zinc-400 transition hover:text-white">
          Kurse
        </Link>
        <ChevronRight className="size-3.5 text-zinc-600" />
        <span className="font-medium text-zinc-200">{courseModule.title}</span>
      </nav>

      {/* Modul-Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-surface-900/70 p-8">
        <div className={`pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-gradient-to-br opacity-30 [mask-image:radial-gradient(closest-side,black,transparent)] ${courseModule.gradient}`} />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <span className={`grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white ${courseModule.gradient}`}>
              <DataIcon name={courseModule.icon} className="size-8" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {courseModule.title}
              </h1>
              <p className="mt-1.5 max-w-xl text-zinc-400">{courseModule.subtitle}</p>
              <p className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                <Clock className="size-4" />
                {courseModule.lessons.length} Lektionen ·{" "}
                {courseModule.lessons.reduce((sum, lesson) => sum + lesson.duration, 0)} Min. gesamt
              </p>
            </div>
          </div>
          <TierBadge tier={courseModule.tier} locked={!unlocked} />
        </div>
      </div>

      {/* Upgrade-Panel bei gesperrtem Modul */}
      {!unlocked && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gold-400/25 bg-gradient-to-r from-gold-500/10 to-surface-900 p-6">
          <div className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-gold-400/15 text-gold-400">
              <Lock className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-white">
                Dieses Modul gehört zur Stufe {TIER_INFO[courseModule.tier].label}.
              </p>
              <p className="text-sm text-zinc-400">
                Upgrade deinen Account, um alle {courseModule.lessons.length} Lektionen freizuschalten.
              </p>
            </div>
          </div>
          <Link
            href="/einstellungen"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2.5 text-sm font-semibold text-surface-950 transition hover:opacity-90"
          >
            Jetzt upgraden <ArrowUpRight className="size-4" />
          </Link>
        </div>
      )}

      {/* Lektionen */}
      <ol className="space-y-3">
        {courseModule.lessons.map((lesson, i) => {
          const KindIcon = KIND_ICON[lesson.kind];
          const inner = (
            <>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${unlocked ? "bg-white/5 text-zinc-300" : "bg-white/[0.03] text-zinc-600"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${unlocked ? "text-white" : "text-zinc-500"}`}>
                  {lesson.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500">{lesson.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs text-zinc-500">
                <span className="hidden items-center gap-1.5 sm:flex">
                  <KindIcon className="size-3.5" />
                  {KIND_LABEL[lesson.kind]}
                </span>
                <span>{lesson.duration} Min.</span>
                {unlocked ? (
                  <span className="grid size-8 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                    <Play className="size-3.5" />
                  </span>
                ) : (
                  <Lock className="size-4 text-zinc-600" />
                )}
              </div>
            </>
          );

          return (
            <li key={lesson.slug}>
              {unlocked ? (
                <Link
                  href={`/kurse/${courseModule.slug}/${lesson.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/8 bg-surface-900/70 p-4 transition hover:border-brand-500/30 hover:bg-surface-850"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-surface-900/40 p-4">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
