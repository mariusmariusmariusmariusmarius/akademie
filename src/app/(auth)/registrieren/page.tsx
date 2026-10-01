"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/lib/auth/actions";
import { Field, FormError, SubmitButton } from "@/components/ui/form";

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, {});

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">Kostenlos starten</h1>
      <p className="mb-7 text-sm text-zinc-400">
        Erstell deinen Account und sieh dir an, was dich im Kurs erwartet.
      </p>

      <form action={formAction} className="space-y-4">
        <FormError error={state.error} />
        <Field
          label="Name"
          name="name"
          type="text"
          placeholder="Dein Name"
          autoComplete="name"
          required
        />
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
          placeholder="Mind. 8 Zeichen"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <SubmitButton>Account erstellen</SubmitButton>
      </form>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Mit der Registrierung akzeptierst du unsere{" "}
        <Link href="/agb" className="underline transition hover:text-zinc-300">AGB</Link> und{" "}
        <Link href="/datenschutz" className="underline transition hover:text-zinc-300">
          Datenschutzerklärung
        </Link>.
      </p>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Schon dabei?{" "}
        <Link href="/login" className="font-semibold text-brand-300 transition hover:text-brand-400">
          Zum Login
        </Link>
      </p>
    </div>
  );
}
