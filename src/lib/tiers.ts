/**
 * Account-Stufen der Plattform.
 * Die Reihenfolge definiert die Rangfolge: Jede Stufe schaltet
 * alle Inhalte der darunterliegenden Stufen mit frei.
 *
 * Später: Stufe wird über Stripe-Subscription gesetzt (Webhook → DB).
 */
export const TIERS = ["free", "starter", "pro"] as const;
export type Tier = (typeof TIERS)[number];

export type Role = "member" | "admin";

export const TIER_INFO: Record<
  Tier,
  {
    label: string;
    price: string;
    priceHint: string;
    tagline: string;
    features: string[];
    /** Kleingedruckte Einordnung unter der Merkmalsliste */
    hinweis?: string;
    highlight?: boolean;
    /** Noch nicht buchbar. Die Karte wirbt, der Knopf fehlt. */
    demnaechst?: boolean;
  }
> = {
  free: {
    label: "Free",
    price: "0 €",
    priceHint: "für immer",
    tagline: "Schau dich in Ruhe um",
    features: [
      "Account und komplette Kursübersicht",
      "Community mitlesen",
      "Keine Zahlungsdaten nötig",
    ],
    hinweis: "Lektionen und Werkzeuge sind hier noch gesperrt.",
  },
  starter: {
    label: "Starter",
    price: "49,90 €",
    priceHint: "pro Monat",
    tagline: "Die ganze Website, von der leeren Seite bis zu Google",
    features: [
      "Alle fünf Module, 19 Lektionen",
      "Fertige Prompts zu jeder Lektion zum Kopieren",
      "Persönlicher API-Schlüssel: ein Zugang für alles",
      "Hosting für bis zu 3 Websites, ohne eigenes Konto",
      "Domain und DNS über Cloudflare, ohne DNS-Tabellen",
      "Eigener Mailserver: bis zu 30 Postfächer auf deinen Domains",
      "SEO- und Marktdaten von DataForSEO, ohne eigenes Konto",
      "Community aktiv nutzen",
    ],
    highlight: true,
  },
  pro: {
    label: "Pro",
    price: "Coming soon",
    priceHint: "",
    tagline: "Vom Projekt zum Business",
    features: [
      "Alles aus Starter",
      "30 Minuten 1:1-Coaching pro Woche",
      "Ads & Marketing",
      "Onlineshop mit Stripe und Lieferanten-APIs",
      "Web-Apps, Server & Datenbank",
      "Eigene Tools: Terminbuchung, Admin-App und mehr",
      "Websites verkaufen: Preise, Kunden, Wartung",
    ],
    demnaechst: true,
  },
};

export function tierRank(tier: Tier): number {
  return TIERS.indexOf(tier);
}

/** Hat ein Account mit `userTier` Zugriff auf Inhalte der Stufe `required`? */
export function hasAccess(userTier: Tier, required: Tier): boolean {
  return tierRank(userTier) >= tierRank(required);
}
