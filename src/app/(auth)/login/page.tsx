"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/lib/auth/actions";
import { Field, FormError, SubmitButton } from "@/components/ui/form";

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, {});

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">Willkommen zurück</h1>
      <p className="mb-7 text-sm text-zinc-400">Logg dich ein und bau weiter.</p>

      <form action={formAction} className="space-y-4">
        <FormError error={state.error} />
        <Field
          label="E-Mail"
          name="email"
          type="email"
          placeholder="du@beispiel.de"
          autoComplete="email"
          required
        />
        <Field
          label="Passwort"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400 transition hover:text-zinc-300">
            <input
              type="checkbox"
              name="bleiben"
              value="ja"
              defaultChecked
              className="size-3.5 accent-brand-500"
            />
            Angemeldet bleiben
          </label>
          <Link
            href="/passwort-vergessen"
            className="text-xs text-zinc-400 transition hover:text-brand-300"
          >
            Passwort vergessen?
          </Link>
        </div>
        <SubmitButton>Einloggen</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Noch keinen Account?{" "}
        <Link href="/registrieren" className="font-semibold text-brand-300 transition hover:text-brand-400">
          Kostenlos registrieren
        </Link>
      </p>
    </div>
  );
}
