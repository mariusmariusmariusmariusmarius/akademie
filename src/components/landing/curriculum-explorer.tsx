"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Clock, FileText, Play, Presentation } from "lucide-react";
import { SICHTBARE_MODULE } from "@/lib/data/curriculum";
import { DataIcon } from "@/components/icon-map";
import { TierBadge } from "@/components/ui/tier-badge";

const EASE = [0.16, 1, 0.3, 1] as const;
const KIND_ICON = { video: Play, text: FileText, case: Presentation } as const;
const KIND_LABEL = { video: "Video", text: "Artikel", case: "Praxis-Case" } as const;

/** Interaktive Modul-Vorstellung auf der Landingpage: alle 9 Module mit allen Lektionen. */
export function CurriculumExplorer() {
  const [activeSlug, setActiveSlug] = useState(SICHTBARE_MODULE[0].slug);
  const active = SICHTBARE_MODULE.find((m) => m.slug === activeSlug)!;
  const activeIndex = SICHTBARE_MODULE.indexOf(active);
  const totalMinutes = active.lessons.reduce((sum, l) => sum + l.duration, 0);

  return (
    <div>
      {/* Modul-Auswahl */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {SICHTBARE_MODULE.map((mod, i) => {
          const selected = mod.slug === activeSlug;
          return (
            <button
              key={mod.slug}
              onClick={() => setActiveSlug(mod.slug)}
              className={`flex shrink-0 items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                selected
                  ? "border-brand-500/50 bg-brand-500/15 text-white"
                  : "border-white/8 bg-surface-900/70 text-zinc-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white ${mod.gradient} ${selected ? "" : "opacity-60"}`}
              >
                <DataIcon name={mod.icon} className="size-3.5" />
              </span>
              <span className="whitespace-nowrap">
                <span className="mr-1.5 font-mono text-xs text-zinc-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {mod.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modul-Detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.slug}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface-900/70"
        >
          <div className="grid lg:grid-cols-5">
            {/* Modul-Info */}
            <div className="relative overflow-hidden border-b border-white/8 p-8 lg:col-span-2 lg:border-b-0 lg:border-r">
              <div
                className={`pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-gradient-to-br opacity-30 [mask-image:radial-gradient(closest-side,black,transparent)] ${active.gradient}`}
              />
              <div className="relative">
                <span
                  className={`mb-5 inline-grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white ${active.gradient}`}
                >
                  <DataIcon name={active.icon} className="size-7" />
                </span>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Modul {String(activeIndex + 1).padStart(2, "0")}
                </p>
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-white">
                  {active.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-zinc-400">
                  {active.subtitle}
                </p>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <TierBadge tier={active.tier} />
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Clock className="size-3.5" />
                    {active.lessons.length} Lektionen · {totalMinutes} Min.
                  </span>
                </div>
                <Link
                  href="/registrieren"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:opacity-90"
                >
                  {active.tier === "free" ? "Kostenlos ansehen" : "Freischalten"}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Lektionsliste */}
            <div className="max-h-[420px] overflow-y-auto p-4 lg:col-span-3">
              <ol className="space-y-1.5">
                {active.lessons.map((lesson, i) => {
                  const KindIcon = KIND_ICON[lesson.kind];
                  return (
                    <motion.li
                      key={lesson.slug}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.03, duration: 0.35, ease: EASE }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.04]"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 font-mono text-xs font-bold text-zinc-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {lesson.title}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {lesson.description}
                        </p>
                      </div>
                      <span className="hidden shrink-0 items-center gap-1 text-xs text-zinc-600 sm:flex">
                        <KindIcon className="size-3" />
                        {KIND_LABEL[lesson.kind]}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-600">
                        {lesson.duration} Min.
                      </span>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
