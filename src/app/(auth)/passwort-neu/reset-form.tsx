"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { resetPasswordAction } from "@/lib/auth/actions";
import { Field, FormError, SubmitButton } from "@/components/ui/form";

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, {});

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-400">
          <TriangleAlert className="size-7" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
          Link unvollständig
        </h1>
        <p className="mb-7 text-sm text-zinc-400">
          In der Adresse fehlt der Schlüssel. Fordere den Link am besten neu an.
        </p>
        <Link
          href="/passwort-vergessen"
          className="font-semibold text-brand-300 transition hover:text-brand-400"
        >
          Neuen Link anfordern
        </Link>
      </div>
    );
  }

  if (state.done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
          <CircleCheck className="size-7" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
          Passwort geändert
        </h1>
        <p className="mb-7 text-sm text-zinc-400">
          Du kannst dich ab sofort mit dem neuen Passwort einloggen.
        </p>
        <Link
          href="/login"
          className="font-semibold text-brand-300 transition hover:text-brand-400"
        >
          Zum Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">
        Neues Passwort setzen
      </h1>
      <p className="mb-7 text-sm text-zinc-400">
        Denk dir eins aus, das du sonst nirgends benutzt.
      </p>

      <form action={formAction} className="space-y-4">
        <FormError error={state.error} />
        <input type="hidden" name="token" value={token} />
        <Field
          label="Neues Passwort"
          name="password"
          type="password"
          placeholder="Mind. 8 Zeichen"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Field
          label="Noch einmal"
          name="password2"
          type="password"
          placeholder="Zur Sicherheit wiederholen"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <SubmitButton>Passwort speichern</SubmitButton>
      </form>
    </div>
  );
}
