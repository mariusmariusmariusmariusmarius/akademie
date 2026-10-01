"use server";

import { revalidatePath } from "next/cache";
import { findUserByEmail, normalisiereEmail } from "@/lib/auth/users";
import { bestaetigeKuendigung, meldeKuendigung } from "@/lib/auth/mails";
import { stripe, stripeBereit } from "@/lib/zahlung/stripe";

/**
 * Kündigungsschaltfläche nach § 312k BGB.
 *
 * Online geschlossene Abos müssen online kündbar sein, ohne Login, ohne
 * Umweg über den Support. Vorgeschrieben sind: eine Schaltfläche „Verträge
 * hier kündigen", eine Bestätigungsseite mit den Angaben unten, eine
 * Schaltfläche „Jetzt kündigen" und eine sofortige Eingangsbestätigung in
 * Textform mit Eingangszeitpunkt und Vertragsende.
 *
 * Wenn die angegebene Adresse zu einem laufenden Abo gehört, wird es bei
 * Stripe direkt zum Ende des bezahlten Zeitraums gestellt. Das ist
 * umkehrbar und der Kunde bekommt in jedem Fall eine Mail, ein Missbrauch
 * fiele also sofort auf. Ohne Treffer wird die Kündigung nur gemeldet und
 * von Hand bearbeitet.
 */

export type KuendigungsErgebnis = {
  fehler?: string;
  erledigt?: boolean;
  endetZum?: string;
};

const DATUM = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const ZEITPUNKT = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Berlin",
});

export async function kuendigenAction(
  _vorher: KuendigungsErgebnis,
  formData: FormData
): Promise<KuendigungsErgebnis> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalisiereEmail(String(formData.get("email") ?? ""));
  const art = String(formData.get("art") ?? "ordentlich");
  const grund = String(formData.get("grund") ?? "").trim();

  if (!name) return { fehler: "Bitte trag deinen Namen ein." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { fehler: "Bitte trag die E-Mail-Adresse deines Accounts ein." };
  }

  const jetzt = new Date();
  const eingang = ZEITPUNKT.format(jetzt);

  // Zum Ende des bezahlten Zeitraums, sonst sofort.
  let endet = jetzt;
  let beiStripe = "kein laufendes Abo gefunden, von Hand prüfen";

  const user = await findUserByEmail(email);

  if (art === "ordentlich" && user?.abo?.id && stripeBereit()) {
    try {
      const abo = await stripe().subscriptions.update(user.abo.id, {
        cancel_at_period_end: true,
        cancellation_details: { comment: grund || undefined },
      });
      const ende = abo.cancel_at ?? abo.items.data[0]?.current_period_end;
      if (ende) endet = new Date(ende * 1000);
      beiStripe = `zum ${DATUM.format(endet)} gekündigt (${abo.id})`;
    } catch (e) {
      console.error("[kuendigung] Stripe:", e);
      beiStripe = "Stripe hat abgelehnt, bitte von Hand kündigen";
    }
  } else if (art !== "ordentlich") {
    beiStripe = "außerordentliche Kündigung, bitte von Hand prüfen";
  }

  const vertrag = user
    ? `Mitgliedschaft gefundenwerden.online Academy, Stufe ${user.tier}`
    : "Mitgliedschaft gefundenwerden.online Academy";

  await meldeKuendigung({
    name,
    email,
    vertrag,
    art: art === "ordentlich" ? "ordentlich, zum Ende der Laufzeit" : "außerordentlich",
    grund,
    automatisch: beiStripe,
  });

  await bestaetigeKuendigung({
    name,
    email,
    vertrag,
    eingang,
    endetZum: DATUM.format(endet),
    art: art === "ordentlich" ? "ordentlich, zum Ende der Laufzeit" : "außerordentlich",
  });

  revalidatePath("/einstellungen");
  return { erledigt: true, endetZum: DATUM.format(endet) };
}
