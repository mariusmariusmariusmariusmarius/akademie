"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail, merkeStripeKunde, updateUser } from "@/lib/auth/users";
import { PLATTFORM_URL } from "@/lib/config";
import type { Tier } from "@/lib/tiers";
import { PREIS_ID, buchbar, stripe } from "@/lib/zahlung/stripe";

/**
 * Bezahlvorgang starten.
 *
 * Statt den Kunden zu Stripe zu schicken, legen wir das Abo hier direkt an
 * und geben nur das Zahlungsgeheimnis zurück. Das Formular baut die Seite
 * selbst (Payment Element), es sitzt also im eigenen Layout und im eigenen
 * Design. Kartendaten gehen trotzdem direkt vom Browser zu Stripe und
 * berühren unseren Server nie.
 *
 * Das Abo entsteht als `incomplete`: es zählt erst, wenn die erste Zahlung
 * durch ist. Freigeschaltet wird die Stufe ausschließlich vom Webhook.
 */
export async function zahlungVorbereiten(stufe: string): Promise<{
  geheimnis?: string;
  betrag?: number;
  fehler?: string;
}> {
  const session = await getSession();
  if (!session) redirect("/login");

  const gewuenscht = stufe as Tier;
  if (!buchbar(gewuenscht)) {
    return { fehler: "Diese Stufe ist gerade nicht buchbar." };
  }
  const preis = PREIS_ID[gewuenscht as "starter" | "pro"];
  if (!preis) return { fehler: "Für diese Stufe fehlt der Preis." };

  const user = await findUserByEmail(session.email);
  if (!user) redirect("/login");

  const s = stripe();

  // Einmal angelegter Kunde bleibt bestehen, damit Rechnungen und
  // Zahlungsmittel eines Nutzers zusammenbleiben.
  let kunde = user.stripeKunde;
  if (!kunde) {
    const neu = await s.customers.create({
      email: user.email,
      name: user.name,
      metadata: { email: user.email, account: user.id },
    });
    kunde = neu.id;
    await updateUser(user.email, { stripeKunde: kunde });
    await merkeStripeKunde(kunde, user.email);
  }

  try {
    // Ein bereits begonnener, aber nicht bezahlter Versuch wird
    // weiterverwendet. Sonst sammelt jeder Seitenaufruf ein totes Abo an.
    const offen = await s.subscriptions.list({
      customer: kunde,
      status: "incomplete",
      limit: 5,
      expand: ["data.latest_invoice.confirmation_secret"],
    });
    const passend = offen.data.find(
      (a) => a.items.data[0]?.price?.id === preis
    );

    const abo =
      passend ??
      (await s.subscriptions.create({
        customer: kunde,
        items: [{ price: preis }],
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        metadata: { email: user.email, account: user.id, stufe: gewuenscht },
        expand: ["latest_invoice.confirmation_secret"],
      }));

    const rechnung = abo.latest_invoice;
    const geheimnis =
      rechnung && typeof rechnung !== "string"
        ? rechnung.confirmation_secret?.client_secret
        : undefined;

    if (!geheimnis) {
      return { fehler: "Stripe hat kein Zahlungsgeheimnis geliefert." };
    }

    const betrag =
      rechnung && typeof rechnung !== "string" ? rechnung.amount_due : undefined;

    return { geheimnis, betrag };
  } catch (e) {
    console.error("[stripe] Abo vorbereiten:", e);
    return { fehler: "Der Bezahlvorgang lässt sich gerade nicht starten." };
  }
}

/**
 * Rechnungen, Zahlungsmittel und Kündigung: das übernimmt das
 * Stripe-Kundenportal. Eigene Masken dafür zu bauen wäre doppelte Arbeit
 * und rechtlich heikler.
 */
export async function portalAction(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findUserByEmail(session.email);
  if (!user?.stripeKunde) redirect("/einstellungen?tab=rechnung");

  // Die Konfiguration wird ausdrücklich mitgegeben: im selben Stripe-Konto
  // liegen andere Produkte, und die sollen im Portal der Academy nicht
  // auftauchen.
  const konfiguration = process.env.STRIPE_PORTAL_KONFIG;
  const portal = await stripe().billingPortal.sessions.create({
    customer: user.stripeKunde,
    locale: "de",
    ...(konfiguration ? { configuration: konfiguration } : {}),
    return_url: `${PLATTFORM_URL}/einstellungen?tab=rechnung`,
  });

  redirect(portal.url);
}
