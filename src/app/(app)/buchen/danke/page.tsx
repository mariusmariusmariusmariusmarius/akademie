import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { stripe, stripeBereit } from "@/lib/zahlung/stripe";

export const metadata = { title: "Danke" };

/**
 * Rücksprung aus der eingebetteten Bezahlmaske.
 *
 * Die Stufe wird hier bewusst NICHT gesetzt. Diese Seite kann jeder
 * aufrufen; verbindlich ist allein der signierte Webhook. Hier steht nur,
 * was Stripe zur Sitzung sagt.
 */
export default async function DankePage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string }>;
}) {
  await getSession();
  const { payment_intent: absicht, redirect_status: stand } = await searchParams;
  if (!absicht || !stripeBereit()) redirect("/einstellungen?tab=rechnung");

  let zustand = stand ?? "";
  try {
    const pi = await stripe().paymentIntents.retrieve(absicht);
    zustand = pi.status;
  } catch {
    // Stripe nicht erreichbar: dann gilt, was in der Adresse steht.
  }

  const bezahlt = zustand === "succeeded";
  const laeuft = zustand === "processing" || zustand === "requires_action";

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10 text-center">
      <span
        className={`mx-auto grid size-16 place-items-center rounded-2xl ${
          bezahlt
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-amber-400/15 text-amber-300"
        }`}
      >
        {bezahlt ? <CheckCircle2 className="size-8" /> : <Clock className="size-8" />}
      </span>

      <h1 className="text-3xl font-bold tracking-tight text-white">
        {bezahlt
          ? "Danke, das hat geklappt"
          : laeuft
            ? "Zahlung wird noch geprüft"
            : "Zahlung nicht abgeschlossen"}
      </h1>

      <p className="text-zinc-400">
        {bezahlt
          ? "Deine Zahlung ist durch. Sobald Stripe sie bestätigt hat, steht deine neue Stufe im Account. Das dauert meist nur Sekunden, die Bestätigung kommt zusätzlich per E-Mail."
          : laeuft
            ? "Stripe prüft die Zahlung noch. Bei Lastschrift dauert das ein paar Tage. Sobald sie durch ist, wird deine Stufe freigeschaltet und du bekommst eine E-Mail."
            : "Der Vorgang wurde nicht abgeschlossen. Es wurde nichts abgebucht. Du kannst es jederzeit erneut versuchen."}
      </p>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          href="/kurse"
          className="rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Zu den Kursen
        </Link>
        <Link
          href="/einstellungen?tab=rechnung"
          className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20"
        >
          Rechnung &amp; Abo
        </Link>
      </div>
    </div>
  );
}
