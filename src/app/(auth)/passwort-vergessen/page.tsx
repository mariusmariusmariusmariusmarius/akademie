"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Field, FormError, SubmitButton } from "@/components/ui/form";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordAction, {});

  if (state.done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
          <MailCheck className="size-7" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">Check dein Postfach</h1>
        <p className="mb-7 text-sm text-zinc-400">
          Wenn die E-Mail-Adresse registriert ist, bekommst du gleich einen Link
          zum Zurücksetzen deines Passworts.
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-brand-300 transition hover:text-brand-400"
        >
          Zurück zum Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">Passwort vergessen?</h1>
      <p className="mb-7 text-sm text-zinc-400">
        Kein Problem. Gib deine E-Mail-Adresse ein und wir schicken dir einen
        Link zum Zurücksetzen.
      </p>

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
        <SubmitButton>Link anfordern</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Doch wieder eingefallen?{" "}
        <Link href="/login" className="font-semibold text-brand-300 transition hover:text-brand-400">
          Zum Login
        </Link>
      </p>
    </div>
  );
}
