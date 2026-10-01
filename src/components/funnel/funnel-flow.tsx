"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";
import {
  evaluateFunnel,
  FUNNEL_QUESTIONS,
  type FunnelResult,
} from "@/lib/data/funnel";
import { getModule } from "@/lib/data/curriculum";
import { TIER_INFO } from "@/lib/tiers";
import { TierBadge } from "@/components/ui/tier-badge";
import { DataIcon } from "@/components/icon-map";

const EASE = [0.16, 1, 0.3, 1] as const;

type Step =
  | { kind: "intro" }
  | { kind: "question"; index: number }
  | { kind: "email" }
  | { kind: "result" };

export function FunnelFlow() {
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<FunnelResult | null>(null);

  function answer(questionId: string, optionId: string, index: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    // Kurze Pause, damit die Auswahl sichtbar aufleuchtet
    setTimeout(() => {
      if (index + 1 < FUNNEL_QUESTIONS.length) {
        setStep({ kind: "question", index: index + 1 });
      } else {
        setStep({ kind: "email" });
      }
    }, 350);
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Später: Lead in Neon speichern + Ergebnis-Mail via Resend + Pixel-Event
    setResult(evaluateFunnel(answers));
    setStep({ kind: "result" });
  }

  const questionIndex = step.kind === "question" ? step.index : null;

  return (
    <div className="relative mx-auto flex min-h-[80vh] w-full max-w-xl flex-col justify-center px-5 py-10">
      {/* Fortschritt */}
      {step.kind === "question" && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <button
              onClick={() =>
                setStep(
                  step.index === 0
                    ? { kind: "intro" }
                    : { kind: "question", index: step.index - 1 }
                )
              }
              className="flex items-center gap-1 transition hover:text-white"
            >
              <ArrowLeft className="size-3.5" /> Zurück
            </button>
            <span>
              Frage {step.index + 1} von {FUNNEL_QUESTIONS.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
              animate={{
                width: `${((step.index + 1) / FUNNEL_QUESTIONS.length) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Intro */}
        {step.kind === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-center"
          >
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300">
              <Sparkles className="size-3.5 text-gold-400" />
              Kostenloser 60-Sekunden-Check
            </p>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Welcher Website-Typ
              <br />
              <span className="text-gradient">bist du?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-pretty text-zinc-400">
              5 Fragen — und du bekommst deinen persönlichen Fahrplan zur
              eigenen Website, ganz ohne Baukasten. Ehrlich, konkret, machbar.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep({ kind: "question", index: 0 })}
              className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-brand-600/30"
            >
              Los geht&apos;s
              <ArrowRight className="size-4" />
            </motion.button>
            <p className="mt-4 text-xs text-zinc-600">
              Dauert unter eine Minute · keine Anmeldung nötig
            </p>
          </motion.div>
        )}

        {/* Fragen */}
        {questionIndex !== null && (
          <motion.div
            key={`q-${questionIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {(() => {
              const q = FUNNEL_QUESTIONS[questionIndex];
              return (
                <>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    {q.question}
                  </h2>
                  {q.hint && (
                    <p className="mt-2 text-sm text-zinc-500">{q.hint}</p>
                  )}
                  <div className="mt-7 space-y-3">
                    {q.options.map((opt) => {
                      const selected = answers[q.id] === opt.id;
                      return (
                        <motion.button
                          key={opt.id}
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => answer(q.id, opt.id, questionIndex)}
                          className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-brand-500/60 bg-brand-500/15 ring-2 ring-brand-500/30"
                              : "border-white/10 bg-surface-900/70 hover:border-white/20 hover:bg-surface-850"
                          }`}
                        >
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/5 text-xl">
                            {opt.emoji}
                          </span>
                          <span className="flex-1 font-medium text-white">
                            {opt.label}
                          </span>
                          {selected && (
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                              <Check className="size-3.5" />
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* E-Mail-Gate */}
        {step.kind === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-center"
          >
            <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/25 to-accent-500/25 text-brand-300 ring-1 ring-brand-500/30">
              <Mail className="size-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Dein Plan ist fertig!
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-zinc-400">
              Wohin dürfen wir deinen persönlichen Fahrplan schicken? Du siehst
              das Ergebnis direkt hier auf der Seite.
            </p>
            <form onSubmit={submitEmail} className="mx-auto mt-8 max-w-sm space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dein Vorname (optional)"
                className="w-full rounded-xl border border-white/10 bg-surface-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="w-full rounded-xl border border-white/10 bg-surface-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-600/30"
              >
                Ergebnis anzeigen →
              </motion.button>
            </form>
            <p className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-1.5 text-xs text-zinc-600">
              <Lock className="size-3" />
              Kein Spam. Abmeldung jederzeit. Details in der{" "}
              <Link href="/datenschutz" className="underline hover:text-zinc-400">
                Datenschutzerklärung
              </Link>
            </p>
          </motion.div>
        )}

        {/* Ergebnis */}
        {step.kind === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="py-6"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
              className="mb-5 text-center text-6xl"
            >
              {result.profile.emoji}
            </motion.div>
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-400">
              Dein Ergebnis{name ? `, ${name.trim()}` : ""}
            </p>
            <h2 className="mt-2 text-center text-3xl font-bold tracking-tight md:text-4xl">
              {result.profile.title}
            </h2>
            <p className="mt-3 text-center text-lg text-zinc-300">
              {result.profile.headline}
            </p>

            <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-400">
              <p>{result.profile.description}</p>
              <p>{result.painText}</p>
              <p className="font-medium text-zinc-300">{result.zeitText}</p>
            </div>

            {/* Fahrplan */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-surface-900/70 p-6">
              <h3 className="mb-4 font-semibold text-white">Dein Fahrplan</h3>
              <ol className="space-y-3">
                {result.profile.roadmap.map((item, i) => (
                  <motion.li
                    key={item.phase}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5, ease: EASE }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 shrink-0 rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-semibold text-brand-300">
                      {item.phase}
                    </span>
                    <span className="text-sm text-zinc-300">{item.text}</span>
                  </motion.li>
                ))}
              </ol>
            </div>

            {/* Empfohlene Module */}
            <div className="mt-4 grid gap-3">
              {result.profile.moduleSlugs.map((slug) => {
                const mod = getModule(slug);
                // Module in Planung tauchen im Funnel nicht auf.
                if (!mod || mod.nurAdmin) return null;
                return (
                  <div
                    key={slug}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-surface-900/70 p-4"
                  >
                    <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${mod.gradient}`}>
                      <DataIcon name={mod.icon} className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{mod.title}</p>
                      <p className="text-xs text-zinc-500">{mod.lessons.length} Lektionen</p>
                    </div>
                    <TierBadge tier={mod.tier} />
                  </div>
                );
              })}
            </div>

            {/* Empfehlung + CTA */}
            <div className="mt-6 rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-600/15 to-surface-900 p-6 text-center">
              <p className="text-sm text-zinc-400">Unsere Empfehlung für dich:</p>
              <p className="mt-1 font-display text-2xl font-bold text-white">
                {TIER_INFO[result.profile.recommendedTier].label} ·{" "}
                {TIER_INFO[result.profile.recommendedTier].price}
                <span className="text-sm font-normal text-zinc-500">
                  {" "}/ {TIER_INFO[result.profile.recommendedTier].priceHint.replace("pro ", "")}
                </span>
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-5">
                <Link
                  href="/registrieren"
                  className="block rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-600/30"
                >
                  Kostenlos starten — Basics sind frei
                </Link>
              </motion.div>
              <Link
                href="/#preise"
                className="mt-3 block text-sm text-zinc-400 underline-offset-2 transition hover:text-white hover:underline"
              >
                Alle Stufen ansehen
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
