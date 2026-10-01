"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";

/**
 * Kleiner Knopf in der Nutzerliste: Willkommens-Mail (noch einmal) schicken.
 * Eigene Datei, weil er den Sendezustand des Formulars braucht und die
 * Adminseite selbst eine Serverkomponente bleibt.
 */
export function MailKnopf({
  erneut,
  email,
}: {
  erneut: boolean;
  email: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      // Geht an einen echten Menschen, also einmal nachfragen.
      onClick={(e) => {
        if (!confirm(`Willkommens-Mail an ${email} schicken?`)) {
          e.preventDefault();
        }
      }}
      title={erneut ? "Willkommens-Mail erneut schicken" : "Willkommens-Mail jetzt schicken"}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-400 transition hover:border-white/25 hover:text-white disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Send className="size-3" />
      )}
      {erneut ? "erneut" : "schicken"}
    </button>
  );
}
