import Link from "next/link";
import { ArrowRight, BookOpen, Flame, Lock, MessagesSquare, Play } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasAccess, TIER_INFO } from "@/lib/tiers";
import { SICHTBARE_MODULE, totalLessons } from "@/lib/data/curriculum";
import { SEED_POSTS } from "@/lib/data/community";
import { DataIcon } from "@/components/icon-map";
import { TierBadge } from "@/components/ui/tier-badge";
import { Avatar } from "@/components/ui/avatar";
import { DailyChecklist } from "@/components/app/daily-checklist";
import { DomainCheck } from "@/components/app/domain-check";
import { DomainUebersicht } from "@/components/app/domain-uebersicht";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = (await getSession())!;

  const unlockedModules = SICHTBARE_MODULE.filter((m) => hasAccess(session.tier, m.tier));
  const unlockedLessons = unlockedModules.reduce((sum, m) => sum + m.lessons.length, 0);
  const nextModule = unlockedModules[0];
  const nextLesson = nextModule?.lessons[0];
  const latestPosts = SEED_POSTS.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Begrüßung */}
      <div>
        <p className="text-sm text-zinc-500">Schön, dass du da bist 👋</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Moin, {session.name.split(" ")[0]}!
        </h1>
      </div>

      {/* Daily Checklist mit Streak */}
      {nextModule && nextLesson && (
        <DailyChecklist
          lessonTitle={nextLesson.title}
          lessonHref={`/kurse/${nextModule.slug}/${nextLesson.slug}`}
          lessonDuration={nextLesson.duration}
        />
      )}

      {/* Statuskarten */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: BookOpen,
            value: `${unlockedLessons} / ${totalLessons()}`,
            label: "Lektionen freigeschaltet",
            color: "text-brand-300 bg-brand-500/15",
          },
          {
            icon: Flame,
            value: `${unlockedModules.length} / ${SICHTBARE_MODULE.length}`,
            label: "Module verfügbar",
            color: "text-amber-300 bg-amber-400/15",
          },
          {
            icon: MessagesSquare,
            value: `${SEED_POSTS.length}`,
            label: "Beiträge in der Community",
            color: "text-emerald-300 bg-emerald-500/15",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/8 bg-surface-900/70 p-6">
            <div className={`mb-4 inline-grid size-10 place-items-center rounded-xl ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Weiterlernen */}
      {nextModule && nextLesson && (
        <Link
          href={`/kurse/${nextModule.slug}/${nextLesson.slug}`}
          className="group relative block overflow-hidden rounded-3xl border border-brand-500/25 bg-gradient-to-br from-brand-600/15 via-surface-900 to-surface-900 p-7 transition hover:border-brand-500/50"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-600/30 [mask-image:radial-gradient(closest-side,black,transparent)]" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-400">
            Hier weitermachen
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{nextLesson.title}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {nextModule.title} · Lektion 1 · {nextLesson.duration} Min.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition group-hover:scale-[1.03]">
              <Play className="size-4" />
              Jetzt starten
            </span>
          </div>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Module */}
        <section className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Deine Module</h2>
            <Link
              href="/kurse"
              className="flex items-center gap-1 text-sm text-brand-300 transition hover:text-brand-400"
            >
              Alle ansehen <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {SICHTBARE_MODULE.slice(0, 4).map((mod) => {
              const unlocked = hasAccess(session.tier, mod.tier);
              return (
                <Link
                  key={mod.slug}
                  href={`/kurse/${mod.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/8 bg-surface-900/70 p-4 transition hover:border-white/15 hover:bg-surface-850"
                >
                  <span className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${mod.gradient} ${unlocked ? "" : "opacity-40 grayscale"}`}>
                    <DataIcon name={mod.icon} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{mod.title}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {mod.lessons.length} Lektionen
                    </p>
                  </div>
                  {unlocked ? (
                    <ArrowRight className="size-4 shrink-0 text-zinc-600" />
                  ) : (
                    <Lock className="size-4 shrink-0 text-zinc-600" />
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Community-Feed */}
        <section className="lg:col-span-2 space-y-6">
          <DomainUebersicht kompakt />
          <DomainCheck />
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Aus der Community</h2>
            <Link
              href="/community"
              className="flex items-center gap-1 text-sm text-brand-300 transition hover:text-brand-400"
            >
              Öffnen <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {latestPosts.length === 0 ? (
              <Link
                href="/community"
                className="block rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500 transition hover:border-white/20 hover:text-zinc-400"
              >
                Hier ist noch nichts geschrieben worden. Mach den Anfang.
              </Link>
            ) : null}
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href="/community"
                className="block rounded-2xl border border-white/8 bg-surface-900/70 p-4 transition hover:border-white/15 hover:bg-surface-850"
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <Avatar name={post.author} gradient={post.avatarColor} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{post.author}</p>
                    <p className="text-xs text-zinc-500">{post.timestamp}</p>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-zinc-400">
                  {post.title ?? post.body}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Upgrade-Hinweis */}
      {session.tier !== "pro" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gold-400/20 bg-gradient-to-r from-gold-500/10 to-surface-900 p-6">
          <div>
            <p className="font-semibold text-white">
              Du bist auf <TierBadge tier={session.tier} className="mx-1 align-middle" /> —{" "}
              {TIER_INFO[session.tier].tagline.toLowerCase()}.
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Mit einem Upgrade schaltest du weitere Module und die Pro-Lounge frei.
            </p>
          </div>
          <Link
            href="/einstellungen"
            className="rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2.5 text-sm font-semibold text-surface-950 transition hover:opacity-90"
          >
            Stufen ansehen
          </Link>
        </div>
      )}
    </div>
  );
}
