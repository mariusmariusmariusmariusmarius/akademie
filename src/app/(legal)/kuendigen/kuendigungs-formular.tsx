"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { kuendigenAction } from "@/lib/zahlung/kuendigung";

function Knopf() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Wird gesendet …" : "Jetzt kündigen"}
    </button>
  );
}

const FELD =
  "w-full rounded-xl border border-white/10 bg-surface-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-brand-500/50";

export function KuendigungsFormular() {
  const [state, formAction] = useActionState(kuendigenAction, {});

  if (state.erledigt) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-7">
        <h2 className="mb-2 text-lg font-semibold text-white">
          Kündigung eingegangen
        </h2>
        <p className="text-sm leading-relaxed text-emerald-100/80">
          Dein Vertrag endet zum {state.endetZum}. Die Bestätigung mit
          Eingangszeitpunkt und Enddatum ist gerade an deine E-Mail-Adresse
          rausgegangen. Bis zum Enddatum bleibt dein Zugang offen.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.fehler ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.fehler}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-300">
          Art der Kündigung
        </label>
        <select name="art" defaultValue="ordentlich" className={FELD}>
          <option value="ordentlich">
            Ordentliche Kündigung zum Ende der Laufzeit
          </option>
          <option value="ausserordentlich">
            Außerordentliche Kündigung aus wichtigem Grund
          </option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-300">
          Bezeichnung des Vertrags
        </label>
        <input
          type="text"
          name="vertrag"
          readOnly
          value="Mitgliedschaft gefundenwerden.online Academy"
          className={`${FELD} cursor-default text-zinc-400`}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-300" htmlFor="name">
          Dein Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder="Vor- und Nachname"
          className={FELD}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-300" htmlFor="email">
          E-Mail-Adresse deines Accounts
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="du@beispiel.de"
          className={FELD}
        />
        <p className="text-xs text-zinc-600">
          Darüber ordnen wir den Vertrag zu, und dorthin geht die Bestätigung.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-300" htmlFor="grund">
          Grund (freiwillig)
        </label>
        <textarea
          id="grund"
          name="grund"
          rows={3}
          placeholder="Bei einer außerordentlichen Kündigung bitte den wichtigen Grund nennen."
          className={FELD}
        />
      </div>

      <Knopf />
    </form>
  );
}
