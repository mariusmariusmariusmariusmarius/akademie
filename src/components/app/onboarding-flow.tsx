"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  Briefcase,
  Check,
  Globe,
  Loader2,
  Rocket,
  Store,
} from "lucide-react";
import { onboardingFertigAction } from "@/lib/auth/actions";

/**
 * Onboarding nach der Registrierung: drei kurze Schritte, dann direkt in
 * die erste Lektion. Bewusst ohne Pflichtfelder — wer keine Lust hat,
 * kommt mit einem Klick durch. Das gewählte Ziel wird am Account
 * gespeichert und steuert später die Empfehlung im Dashboard.
 */

const ZIELE = [
  {
    wert: "eigene-website",
    icon: Globe,
    titel: "Meine eigene Website",
    text: "Eine Seite fürs eigene Geschäft, die Anfragen bringt.",
  },
  {
    wert: "kunden-websites",
    icon: Briefcase,
    titel: "Websites für Kunden",
    text: "Seiten bauen und verkaufen, als Dienstleistung.",
  },
  {
    wert: "onlineshop",
    icon: Store,
    titel: "Onlineshop",
    text: "Produkte verkaufen, Zahlungen, Versand.",
  },
  {
    wert: "erstmal-schauen",
    icon: Rocket,
    titel: "Erstmal reinschnuppern",
    text: "Ich schaue mir an, was damit geht.",
  },
] as const;

export function OnboardingFlow({ vorname }: { vorname: string }) {
  const [schritt, setSchritt] = useState(0);
  const [ziel, setZiel] = useState<string>("");

  return (
    <div>
      <Fortschritt schritt={schritt} />

      {schritt === 0 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
            Willkommen, {vorname}!
          </h1>
          <p className="mb-6 text-sm text-zinc-400">
            Dein Zugang steht. Bevor es losgeht: zwei kurze Fragen, damit ich
            dir das Richtige zeige. Dauert keine Minute.
          </p>

          <div className="mb-7 space-y-2.5">
            {[
              "Fünf Module mit 19 Lektionen, du siehst zu jeder, was drin steckt",
              "Du brauchst nichts zu installieren und nichts vorzubereiten",
              "Eine Willkommens-Mail liegt in deinem Postfach",
            ].map((t) => (
              <p key={t} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-400" />
                {t}
              </p>
            ))}
          </div>

          <button
            onClick={() => setSchritt(1)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:opacity-90"
          >
            Los geht&apos;s
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {schritt === 1 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
            Was willst du bauen?
          </h1>
          <p className="mb-6 text-sm text-zinc-400">
            Danach richtet sich, was dir im Dashboard vorgeschlagen wird. Du
            kannst das jederzeit in den Einstellungen ändern.
          </p>

          <div className="mb-7 grid gap-2.5">
            {ZIELE.map((z) => {
              const aktiv = ziel === z.wert;
              return (
                <button
                  key={z.wert}
                  type="button"
                  onClick={() => setZiel(z.wert)}
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                    aktiv
                      ? "border-brand-500/60 bg-brand-500/10"
                      : "border-white/8 bg-surface-950/60 hover:border-white/20"
                  }`}
                >
                  <z.icon
                    className={`mt-0.5 size-5 shrink-0 ${
                      aktiv ? "text-brand-300" : "text-zinc-500"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">
                      {z.titel}
                    </span>
                    <span className="block text-sm text-zinc-400">{z.text}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSchritt(2)}
            disabled={!ziel}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:opacity-90 disabled:opacity-40"
          >
            Weiter
            <ArrowRight className="size-4" />
          </button>
          <button
            onClick={() => setSchritt(2)}
            className="mt-3 w-full text-center text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            Weiß ich noch nicht
          </button>
        </div>
      )}

      {schritt === 2 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
            Fertig. Deine erste Lektion wartet.
          </h1>
          <p className="mb-6 text-sm text-zinc-400">
            Sie heißt <strong className="text-zinc-200">„Claude Code, dein
            Mitarbeiter?"</strong> und erklärt in ein paar Minuten, womit du
            hier eigentlich arbeitest. Danach baust du direkt los.
          </p>

          <form action={onboardingFertigAction} className="space-y-3">
            <input type="hidden" name="ziel" value={ziel} />
            <button
              type="submit"
              name="weiter"
              value="lektion"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:opacity-90"
            >
              Kurse ansehen
              <ArrowRight className="size-4" />
            </button>
            <SekundaerKnopf />
          </form>
        </div>
      )}
    </div>
  );
}

function SekundaerKnopf() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="weiter"
      value="dashboard"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      Erstmal ins Dashboard
    </button>
  );
}

function Fortschritt({ schritt }: { schritt: number }) {
  return (
    <div className="mb-7 flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full transition ${
            i <= schritt ? "bg-gradient-to-r from-brand-500 to-accent-500" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}
