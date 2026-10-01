import type { Tier } from "@/lib/tiers";

/**
 * Quiz-Funnel (/funnel): Fragen, Auswertung und Ergebnis-Profile.
 * Der Funnel qualifiziert Besucher (Link in Bio, Ads) und endet mit
 * einer persönlichen Empfehlung + E-Mail-Capture.
 * Später: Leads → Neon, Ergebnis-Mail → Resend, Abschluss → Meta-Pixel-Event.
 */

export type FunnelQuestion = {
  id: string;
  question: string;
  hint?: string;
  options: { id: string; label: string; emoji: string }[];
};

export const FUNNEL_QUESTIONS: FunnelQuestion[] = [
  {
    id: "ziel",
    question: "Was willst du bauen?",
    hint: "Es gibt kein falsch — nur deinen Startpunkt.",
    options: [
      { id: "website", label: "Eine Website für mein eigenes Business", emoji: "🌐" },
      { id: "kunden", label: "Websites für Kunden — als Einkommen", emoji: "💼" },
      { id: "shop", label: "Einen eigenen Onlineshop", emoji: "🛒" },
    ],
  },
  {
    id: "status",
    question: "Wo stehst du gerade?",
    options: [
      { id: "baukasten", label: "Ich zahle für einen Baukasten (Wix, Jimdo …)", emoji: "📦" },
      { id: "nichts", label: "Ich habe noch gar keine Website", emoji: "🕳️" },
      { id: "alt", label: "Es gibt eine alte Seite, die keiner anfasst", emoji: "🕸️" },
    ],
  },
  {
    id: "pain",
    question: "Was nervt dich am meisten?",
    options: [
      { id: "kosten", label: "Laufende Kosten & Abhängigkeit", emoji: "💸" },
      { id: "leads", label: "Es kommen keine Anfragen rein", emoji: "📭" },
      { id: "technik", label: "Technik-Angst — wo fange ich überhaupt an?", emoji: "😵" },
      { id: "zeit", label: "Keine Zeit, mich einzuarbeiten", emoji: "⏰" },
    ],
  },
  {
    id: "zeit",
    question: "Wie viel Zeit hast du pro Woche?",
    hint: "Ehrlich bleiben — der Plan richtet sich danach.",
    options: [
      { id: "lt2", label: "Unter 2 Stunden", emoji: "🌱" },
      { id: "2to5", label: "2–5 Stunden", emoji: "🚶" },
      { id: "gt5", label: "Mehr als 5 Stunden", emoji: "🏃" },
    ],
  },
  {
    id: "ziel3m",
    question: "Wo willst du in 3 Monaten stehen?",
    options: [
      { id: "live", label: "Meine Website ist live — und gehört mir", emoji: "🚀" },
      { id: "anfragen", label: "Es kommen regelmäßig Anfragen rein", emoji: "📬" },
      { id: "umsatz", label: "Erste Verkäufe / erste Kundenprojekte", emoji: "💶" },
    ],
  },
];

export type FunnelProfile = {
  id: string;
  title: string;
  emoji: string;
  headline: string;
  description: string;
  recommendedTier: Tier;
  /** Slugs aus dem Curriculum */
  /** Empfohlene Module. Versteckte werden beim Anzeigen herausgefiltert. */
  moduleSlugs: string[];
  roadmap: { phase: string; text: string }[];
};

const PROFILES: Record<string, FunnelProfile> = {
  selbermacher: {
    id: "selbermacher",
    title: "Der Selbermacher",
    emoji: "🛠️",
    headline: "Deine eigene Website — ohne Baukasten, ohne Agentur.",
    description:
      "Du willst eine Website, die dir gehört: keine Monatsgebühren an einen Baukasten, keine Wartezeit auf Dienstleister. Genau dafür ist der Weg von den Basics bis zur Lead-Automation gemacht.",
    recommendedTier: "starter",
    moduleSlugs: [
      "modul-1-basics",
      "modul-2-inhalt-und-design",
      "modul-3-online-gehen",
    ],
    roadmap: [
      { phase: "Woche 1", text: "Basics: Domain, E-Mail & wie Websites wirklich funktionieren" },
      { phase: "Woche 2–3", text: "Deine Website mit Claude bauen und selbst hosten" },
      { phase: "Woche 4", text: "Anfragebogen + Lead-Automation: Besucher werden Anfragen" },
    ],
  },
  webprofi: {
    id: "webprofi",
    title: "Der Web-Profi in spe",
    emoji: "💼",
    headline: "Vom ersten Projekt zum bezahlten Kundenauftrag.",
    description:
      "Du willst mit Websites Geld verdienen. Dann brauchst du den kompletten Werkzeugkasten: bauen, hosten, Leads, Ads — und eigene Tools, die dich von Baukasten-Anbietern abheben.",
    recommendedTier: "pro",
    moduleSlugs: [
      "modul-3-online-gehen",
      "modul-4-domain-und-mail",
      "modul-5-gefunden-werden",
    ],
    roadmap: [
      { phase: "Woche 1–2", text: "Website-Stack meistern: bauen, hosten, Domain, Rechtstexte" },
      { phase: "Woche 3–4", text: "Leads & Ads: Kunden für dich und deine Auftraggeber gewinnen" },
      { phase: "Monat 2+", text: "Eigene Tools & 1:1-Coaching: dein Angebot, das keiner kopiert" },
    ],
  },
  shopbuilder: {
    id: "shopbuilder",
    title: "Der Shop-Builder",
    emoji: "🛒",
    headline: "Dein eigener Shop — Zahlungen, Versand, alles deins.",
    description:
      "Du willst verkaufen, ohne dich von Shop-Baukästen abhängig zu machen. Der Weg: erst das Fundament, dann Shop, Zahlungsanbieter und Warenwirtschaft — Schritt für Schritt.",
    recommendedTier: "pro",
    moduleSlugs: [
      "modul-1-basics",
      "modul-3-online-gehen",
      "modul-5-gefunden-werden",
    ],
    roadmap: [
      { phase: "Woche 1–2", text: "Fundament: Website bauen, hosten, Domain verbinden" },
      { phase: "Woche 3–4", text: "Shop erstellen + Stripe: Einmalzahlungen & Abos" },
      { phase: "Monat 2+", text: "Ads & Conversion-Tracking: aus Besuchern werden Käufer" },
    ],
  },
};

const PAIN_TEXT: Record<string, string> = {
  kosten:
    "Du zahlst gerade für ein System, das dir nicht gehört. Nach dem ersten Modul weißt du, wie du davon unabhängig wirst — einmal bauen statt ewig mieten.",
  leads:
    "Eine Website ohne Anfragen ist nur eine Visitenkarte. Deshalb liegt dein Fokus früh auf Anfragebogen, Lead-Automation und E-Mail-Follow-ups.",
  technik:
    "Technik-Angst ist der häufigste Startpunkt hier — dafür gibt es die Basics: kein Vorwissen nötig, jede Lektion endet mit einem sichtbaren Ergebnis.",
  zeit:
    "Wenig Zeit heißt: klare Reihenfolge statt Tutorial-Chaos. Der Plan unten ist so gebaut, dass jede Session ein fertiges Zwischenergebnis liefert.",
};

const ZEIT_TEXT: Record<string, string> = {
  lt2: "Mit unter 2 Stunden pro Woche rechnest du realistisch in 6–8 Wochen mit deiner ersten Live-Website.",
  "2to5": "Mit 2–5 Stunden pro Woche ist deine erste Website realistisch in 3–4 Wochen live.",
  gt5: "Mit über 5 Stunden pro Woche kannst du in 2 Wochen live sein — und danach direkt an Leads und Umsatz arbeiten.",
};

export type FunnelResult = {
  profile: FunnelProfile;
  painText: string;
  zeitText: string;
};

export function evaluateFunnel(answers: Record<string, string>): FunnelResult {
  const profile =
    answers.ziel === "kunden"
      ? PROFILES.webprofi
      : answers.ziel === "shop"
        ? PROFILES.shopbuilder
        : PROFILES.selbermacher;

  return {
    profile,
    painText: PAIN_TEXT[answers.pain] ?? PAIN_TEXT.technik,
    zeitText: ZEIT_TEXT[answers.zeit] ?? ZEIT_TEXT["2to5"],
  };
}
