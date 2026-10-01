"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Flame, Play, Users2, Wrench } from "lucide-react";

/**
 * Daily Checklist mit Streak (Duolingo-Prinzip).
 * Demo: Speicherung in localStorage — später Neon-Tabelle
 * (daily_checks, streaks) pro Nutzer, damit die Serie geräteübergreifend hält.
 */

type Task = {
  id: string;
  label: string;
  sub?: string;
  href?: string;
  icon: "play" | "wrench" | "users";
};

const ICONS = { play: Play, wrench: Wrench, users: Users2 };

const CHECKS_KEY = "mm_daily_checks";
const STREAK_KEY = "mm_streak";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function DailyChecklist({
  lessonTitle,
  lessonHref,
  lessonDuration,
}: {
  lessonTitle: string;
  lessonHref: string;
  lessonDuration: number;
}) {
  const tasks: Task[] = [
    {
      id: "lesson",
      label: "Nächste Lektion ansehen",
      sub: `${lessonTitle} · ${lessonDuration} Min.`,
      href: lessonHref,
      icon: "play",
    },
    {
      id: "project",
      label: "30 Minuten am eigenen Projekt arbeiten",
      icon: "wrench",
    },
    {
      id: "community",
      label: "In der Community helfen oder ein Update posten",
      href: "/community",
      icon: "users",
    },
  ];

  const [state, setState] = useState<{
    mounted: boolean;
    done: Set<string>;
    streak: number;
  }>({ mounted: false, done: new Set(), streak: 0 });
  const { mounted, done, streak } = state;

  // localStorage erst nach dem Mount lesen (SSR-Hydration)
  useEffect(() => {
    let doneFromStorage = new Set<string>();
    let streakFromStorage = 0;
    try {
      const rawChecks = localStorage.getItem(CHECKS_KEY);
      if (rawChecks) {
        const parsed = JSON.parse(rawChecks) as { date: string; done: string[] };
        if (parsed.date === todayKey()) doneFromStorage = new Set(parsed.done);
      }
      const rawStreak = localStorage.getItem(STREAK_KEY);
      if (rawStreak) {
        const parsed = JSON.parse(rawStreak) as { lastDate: string; count: number };
        // Serie gerissen? (weder heute noch gestern abgeschlossen)
        if (parsed.lastDate === todayKey() || parsed.lastDate === yesterdayKey()) {
          streakFromStorage = parsed.count;
        }
      }
    } catch {
      // defekter Storage — einfach frisch starten
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- einmaliger Hydration-Load aus localStorage
    setState({ mounted: true, done: doneFromStorage, streak: streakFromStorage });
  }, []);

  function setDone(next: Set<string>) {
    setState((prev) => ({ ...prev, done: next }));
  }

  function setStreak(count: number) {
    setState((prev) => ({ ...prev, streak: count }));
  }

  function toggle(id: string) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDone(next);
    localStorage.setItem(
      CHECKS_KEY,
      JSON.stringify({ date: todayKey(), done: [...next] })
    );

    // Alle erledigt → Tag zählt für die Serie
    if (next.size === tasks.length) {
      try {
        const raw = localStorage.getItem(STREAK_KEY);
        const prev = raw
          ? (JSON.parse(raw) as { lastDate: string; count: number })
          : { lastDate: "", count: 0 };
        if (prev.lastDate !== todayKey()) {
          const count = prev.lastDate === yesterdayKey() ? prev.count + 1 : 1;
          localStorage.setItem(
            STREAK_KEY,
            JSON.stringify({ lastDate: todayKey(), count })
          );
          setStreak(count);
        }
      } catch {
        localStorage.setItem(
          STREAK_KEY,
          JSON.stringify({ lastDate: todayKey(), count: 1 })
        );
        setStreak(1);
      }
    }
  }

  const complete = done.size === tasks.length;

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border p-6 transition-colors ${
        complete
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-white/8 bg-surface-900/70"
      }`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            Dein Tag
            {complete && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300"
              >
                Geschafft! 🎉
              </motion.span>
            )}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            {complete
              ? "Stark — bis morgen!"
              : `${done.size} von ${tasks.length} erledigt`}
          </p>
        </div>
        {/* Streak */}
        <motion.div
          animate={complete ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.5 }}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 ${
            streak > 0
              ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 ring-1 ring-amber-400/30"
              : "bg-white/5"
          }`}
        >
          <Flame
            className={`size-5 ${streak > 0 ? "text-amber-400" : "text-zinc-600"}`}
          />
          <div className="leading-tight">
            <p className="font-display text-lg font-bold text-white">
              {mounted ? streak : "–"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              {streak === 1 ? "Tag Serie" : "Tage Serie"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/8">
        <motion.div
          className={`h-full rounded-full ${
            complete
              ? "bg-emerald-400"
              : "bg-gradient-to-r from-brand-500 to-accent-500"
          }`}
          animate={{ width: `${(done.size / tasks.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ul className="space-y-2.5">
        {tasks.map((task) => {
          const checked = done.has(task.id);
          const Icon = ICONS[task.icon];
          return (
            <li
              key={task.id}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 transition ${
                checked
                  ? "border-emerald-500/25 bg-emerald-500/5"
                  : "border-white/8 bg-surface-950/40"
              }`}
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => toggle(task.id)}
                aria-label={checked ? "Als offen markieren" : "Als erledigt markieren"}
                className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition ${
                  checked
                    ? "border-emerald-400 bg-emerald-400 text-surface-950"
                    : "border-zinc-600 hover:border-brand-400"
                }`}
              >
                {checked && <Check className="size-4" strokeWidth={3} />}
              </motion.button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    checked ? "text-zinc-500 line-through" : "text-white"
                  }`}
                >
                  {task.label}
                </p>
                {task.sub && (
                  <p className="truncate text-xs text-zinc-500">{task.sub}</p>
                )}
              </div>
              {task.href && !checked && (
                <Link
                  href={task.href}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-3.5" />
                  Öffnen
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-zinc-600">
        Demo: Wird lokal im Browser gespeichert — mit der Datenbank zählt deine
        Serie geräteübergreifend.
      </p>
    </section>
  );
}
