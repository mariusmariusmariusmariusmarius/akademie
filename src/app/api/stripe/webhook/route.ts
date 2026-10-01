import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeBereit, tierAusAbo } from "@/lib/zahlung/stripe";
import {
  findUserByEmail,
  findUserByStripeKunde,
  merkeStripeKunde,
  updateUser,
  type User,
} from "@/lib/auth/users";
import { meldeAbo, sendeAboMail } from "@/lib/auth/mails";
import { TIER_INFO } from "@/lib/tiers";

/**
 * Stripe-Webhook: die einzige Stelle, an der eine bezahlte Stufe entsteht.
 *
 * Warum nicht direkt nach dem Checkout in der App? Weil der Nutzer die
 * Erfolgsseite nie sehen muss (Tab geschlossen, Netz weg) und weil eine
 * Weiterleitung fälschbar ist. Stripe meldet den Zustand hierher, mit
 * Signatur, und das Ergebnis wird in den Nutzerspeicher geschrieben.
 *
 * Wichtig: Die Signatur wird über den ROHEN Rumpf geprüft. Deshalb
 * `req.text()` und kein `req.json()` — schon ein neu formatiertes JSON
 * bricht die Prüfung.
 */

export const dynamic = "force-dynamic";

async function nutzerZu(
  kunde: string | null,
  email: string | null | undefined
): Promise<User | undefined> {
  if (email) {
    const treffer = await findUserByEmail(email);
    if (treffer) return treffer;
  }
  return kunde ? findUserByStripeKunde(kunde) : undefined;
}

/** Abo-Zustand in den Account schreiben und alle Beteiligten informieren. */
async function uebernehmeAbo(abo: Stripe.Subscription): Promise<void> {
  const kunde = typeof abo.customer === "string" ? abo.customer : abo.customer.id;
  const user = await nutzerZu(kunde, abo.metadata?.email);
  if (!user) {
    console.error("[stripe] Kein Account zu Kunde", kunde);
    return;
  }

  const tier = tierAusAbo(abo);
  const endet = abo.cancel_at ?? abo.ended_at;

  const vorher = user.tier;
  await updateUser(user.email, {
    tier,
    stripeKunde: kunde,
    abo: {
      id: abo.id,
      status: abo.status,
      ...(endet ? { endetAm: new Date(endet * 1000).toISOString() } : {}),
    },
  });
  await merkeStripeKunde(kunde, user.email);

  if (tier === vorher) return;

  // Hochstufung meldet sich beim Kunden, jede Änderung bei Marius.
  if (tier !== "free") {
    await sendeAboMail({
      name: user.name,
      email: user.email,
      stufe: TIER_INFO[tier].label,
    });
  }
  await meldeAbo({
    name: user.name,
    email: user.email,
    stufe: TIER_INFO[tier].label,
    status: abo.status,
  });
}

export async function POST(req: NextRequest) {
  if (!stripeBereit()) {
    return NextResponse.json({ fehler: "Stripe ist nicht eingerichtet." }, { status: 503 });
  }
  const geheim = process.env.STRIPE_WEBHOOK_SECRET;
  if (!geheim) {
    return NextResponse.json({ fehler: "STRIPE_WEBHOOK_SECRET fehlt." }, { status: 503 });
  }

  const roh = await req.text();
  const signatur = req.headers.get("stripe-signature") ?? "";

  let ereignis: Stripe.Event;
  try {
    ereignis = await stripe().webhooks.constructEventAsync(roh, signatur, geheim);
  } catch (e) {
    console.error("[stripe] Signatur ungültig:", e);
    return NextResponse.json({ fehler: "Signatur ungültig." }, { status: 400 });
  }

  try {
    switch (ereignis.type) {
      case "checkout.session.completed": {
        const sitzung = ereignis.data.object;
        if (sitzung.mode !== "subscription" || !sitzung.subscription) break;
        const aboId =
          typeof sitzung.subscription === "string"
            ? sitzung.subscription
            : sitzung.subscription.id;
        // Frisch nachladen: die Sitzung kennt den Preis nicht zuverlässig.
        const abo = await stripe().subscriptions.retrieve(aboId);
        await uebernehmeAbo(abo);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await uebernehmeAbo(ereignis.data.object);
        break;
      }

      default:
        // Alles andere quittieren, ohne etwas zu tun. Stripe schickt mehr
        // Ereignisse, als hier gebraucht werden.
        break;
    }
  } catch (e) {
    // 500 heißt für Stripe: nochmal versuchen. Genau das ist hier richtig,
    // etwa wenn der Blob-Speicher gerade klemmt.
    console.error("[stripe] Verarbeitung fehlgeschlagen:", ereignis.type, e);
    return NextResponse.json({ fehler: "Verarbeitung fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ empfangen: true });
}
