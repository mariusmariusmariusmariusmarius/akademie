import Stripe from "stripe";
import { TIER_INFO, type Tier } from "@/lib/tiers";

/**
 * Stripe-Anbindung der Plattform.
 *
 * Bezahlte Stufen laufen als Abo über Stripe Checkout. Die Wahrheit über
 * die Stufe liegt bei Stripe: der Webhook trägt sie in den Nutzerspeicher
 * ein, sobald eine Zahlung durchgeht oder ein Abo endet. In der App wird
 * die Stufe nie aus einer Bezahlseite heraus gesetzt.
 *
 * Ohne Schlüssel bleibt alles still: `stripeBereit()` liefert false, die
 * Buchen-Knöpfe erscheinen gar nicht erst. So läuft die Plattform auch,
 * solange der Account noch nicht freigeschaltet ist.
 */

/** Preis-IDs je Stufe. Free hat keinen Preis, Free ist der Ausgangszustand. */
export const PREIS_ID: Record<Exclude<Tier, "free">, string | undefined> = {
  starter: process.env.STRIPE_PREIS_STARTER,
  pro: process.env.STRIPE_PREIS_PRO,
};

export function stripeBereit(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Ist diese Stufe buchbar? Dafür braucht es einen Schlüssel, einen Preis
 * und eine Stufe, die nicht als „demnächst" ausgewiesen ist.
 */
export function buchbar(tier: Tier): boolean {
  if (tier === "free" || TIER_INFO[tier].demnaechst) return false;
  return stripeBereit() && Boolean(PREIS_ID[tier]);
}

let client: Stripe | null = null;

export function stripe(): Stripe {
  const schluessel = process.env.STRIPE_SECRET_KEY;
  if (!schluessel) throw new Error("STRIPE_SECRET_KEY fehlt.");
  client ??= new Stripe(schluessel, {
    // Vercel-Funktionen sind kurzlebig; ein Fehlversuch soll nicht die
    // ganze Anfrage kosten.
    maxNetworkRetries: 2,
    appInfo: { name: "gefundenwerden.online Academy" },
  });
  return client;
}

/** Preis-ID zurück auf die Stufe abbilden — dafür kommt der Webhook. */
export function tierZuPreis(preisId: string | null | undefined): Tier | null {
  if (!preisId) return null;
  if (preisId === PREIS_ID.pro) return "pro";
  if (preisId === PREIS_ID.starter) return "starter";
  return null;
}

/**
 * Welche Stufe gehört zu diesem Abo-Zustand?
 *
 * `past_due` zählt bewusst noch als bezahlt: Stripe versucht den Einzug
 * über rund zwei Wochen erneut, und eine abgelaufene Karte soll niemanden
 * sofort aussperren. Erst wenn Stripe endgültig aufgibt (`unpaid`,
 * `canceled`, `incomplete_expired`), fällt der Account auf Free.
 *
 * `incomplete` heißt: das Abo ist angelegt, aber die erste Zahlung steht
 * noch aus. Auch das gibt noch keinen Zugang.
 */
export function tierAusAbo(abo: Stripe.Subscription): Tier {
  const laeuft =
    abo.status === "active" ||
    abo.status === "trialing" ||
    abo.status === "past_due";
  if (!laeuft) return "free";
  const preis = abo.items.data[0]?.price?.id;
  return tierZuPreis(preis) ?? "free";
}
