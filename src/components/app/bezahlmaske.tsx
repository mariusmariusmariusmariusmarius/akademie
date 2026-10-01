"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import {
  AddressElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";
import { zahlungVorbereiten } from "@/lib/zahlung/actions";

/**
 * Zahlung auf der eigenen Seite.
 *
 * Kein fremder Bezahlrahmen und keine Weiterleitung: Zahlungsarten,
 * Rechnungsadresse, Zustimmung und der Bezahlknopf sind Bestandteile
 * dieser Seite und tragen ihr Design. Nur die Felder für Kartennummer und
 * IBAN kommen von Stripe, denn diese Daten dürfen unseren Server nicht
 * berühren; sie gehen direkt vom Browser zu Stripe.
 *
 * Der öffentliche Schlüssel wird erst hier geladen, damit das
 * Stripe-Skript nicht auf jeder Seite der Plattform mitläuft.
 */

const pk = process.env.NEXT_PUBLIC_STRIPE_PK;
const stripePromise = pk ? loadStripe(pk) : null;

/** Stripe-Felder an das dunkle Design der Academy angleichen. */
const aussehen: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#7c6cff",
    colorBackground: "#14141b",
    colorText: "#f4f4f5",
    colorTextSecondary: "#a1a1aa",
    colorTextPlaceholder: "#52525b",
    colorDanger: "#f87171",
    fontFamily: "inherit",
    fontSizeBase: "15px",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "none",
      padding: "12px 14px",
    },
    ".Input:focus": {
      border: "1px solid rgba(124,108,255,0.55)",
      boxShadow: "none",
    },
    ".Label": {
      color: "#d4d4d8",
      fontWeight: "500",
      marginBottom: "6px",
    },
    ".Tab": {
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "none",
      backgroundColor: "rgba(255,255,255,0.02)",
    },
    ".Tab--selected": {
      border: "1px solid rgba(124,108,255,0.55)",
      backgroundColor: "rgba(124,108,255,0.10)",
    },
  },
};

const KASTEN =
  "rounded-3xl border border-white/8 bg-surface-900/70 p-7";

export function Bezahlmaske({
  stufe,
  preis,
}: {
  stufe: string;
  preis: string;
}) {
  const [geheimnis, setGeheimnis] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  useEffect(() => {
    let abgebrochen = false;
    zahlungVorbereiten(stufe).then((a) => {
      if (abgebrochen) return;
      if (a.geheimnis) setGeheimnis(a.geheimnis);
      else setFehler(a.fehler ?? "Der Bezahlvorgang ließ sich nicht starten.");
    });
    return () => {
      abgebrochen = true;
    };
  }, [stufe]);

  if (!stripePromise) {
    return (
      <p className={`${KASTEN} text-sm text-zinc-400`}>
        Die Zahlungsabwicklung ist auf diesem Server nicht eingerichtet.
      </p>
    );
  }

  if (fehler) {
    return (
      <p className="rounded-3xl border border-red-500/30 bg-red-500/10 p-7 text-sm text-red-200">
        {fehler}
      </p>
    );
  }

  if (!geheimnis) {
    return (
      <div className={`${KASTEN} space-y-4`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: geheimnis, appearance: aussehen, locale: "de" }}
    >
      <Formular stufe={stufe} preis={preis} />
    </Elements>
  );
}

function Formular({ stufe, preis }: { stufe: string; preis: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [laeuft, setLaeuft] = useState(false);
  const [zugestimmt, setZugestimmt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !zugestimmt) return;

    setLaeuft(true);
    setFehler(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/buchen/danke?stufe=${stufe}`,
      },
    });

    // Ohne Fehler ist der Nutzer schon unterwegs zur Dankeseite oder zur
    // Bank. Hierher kommt nur, was sofort schiefgeht.
    setFehler(
      error?.message ?? "Die Zahlung ließ sich nicht abschließen. Bitte noch einmal."
    );
    setLaeuft(false);
  }

  return (
    <form onSubmit={absenden} className={`${KASTEN} space-y-6`}>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Rechnungsadresse</h2>
        <AddressElement options={{ mode: "billing" }} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Zahlungsart</h2>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-surface-950/40 p-4">
        <input
          type="checkbox"
          checked={zugestimmt}
          onChange={(e) => setZugestimmt(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-brand-500"
        />
        <span className="text-xs leading-relaxed text-zinc-400">
          Ich habe die{" "}
          <Link href="/agb" target="_blank" className="underline hover:text-zinc-200">
            AGB
          </Link>{" "}
          und die{" "}
          <Link href="/widerruf" target="_blank" className="underline hover:text-zinc-200">
            Widerrufsbelehrung
          </Link>{" "}
          gelesen und stimme zu. Das Abo verlängert sich monatlich und ist
          jederzeit zum Ende des Bezahlzeitraums kündbar.
        </span>
      </label>

      {fehler ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {fehler}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || laeuft || !zugestimmt}
        className="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {laeuft ? "Zahlung läuft …" : `Zahlungspflichtig bestellen · ${preis}`}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-600">
        <Lock className="size-3" />
        Kartendaten gehen verschlüsselt direkt an Stripe, nicht über unseren Server.
      </p>
    </form>
  );
}
