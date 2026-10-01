import { NextResponse } from "next/server";
import { hasAccess, TIER_INFO } from "@/lib/tiers";
import type { User } from "@/lib/auth/users";

/**
 * Werkzeuge der Plattform sind Teil der bezahlten Stufe.
 *
 * Hosting, Domain samt DNS, Postfächer und die SEO-Daten laufen über
 * Konten, die uns Geld kosten. Ohne diese Sperre könnte sich jeder einen
 * kostenlosen Account anlegen und darüber Zonen und Postfächer erzeugen,
 * und der beworbene Vorteil der bezahlten Stufe wäre keiner.
 */
export const WERKZEUG_STUFE = "starter" as const;

export function darfWerkzeuge(user: { tier: User["tier"] }): boolean {
  return hasAccess(user.tier, WERKZEUG_STUFE);
}

/** Einheitliche Absage, wenn die Stufe nicht reicht. */
export function stufeFehlt(): NextResponse {
  return NextResponse.json(
    {
      fehler: `Dieses Werkzeug gehört zur Stufe ${TIER_INFO[WERKZEUG_STUFE].label}. Du kannst es in den Einstellungen freischalten.`,
      benoetigteStufe: WERKZEUG_STUFE,
    },
    { status: 403 }
  );
}
