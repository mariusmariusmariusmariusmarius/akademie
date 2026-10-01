import type { Tier } from "@/lib/tiers";

/**
 * Mock-Daten für den Community-Bereich.
 * Später: eigene Tabellen in Neon + Realtime (z. B. Pusher/Ably oder Polling).
 */

export type Channel = {
  slug: string;
  name: string;
  description: string;
  /** Mindest-Stufe zum Schreiben; lesen dürfen alle eingeloggten Nutzer */
  writeTier: Tier;
  icon: string;
};

export type CommunityPost = {
  id: string;
  channel: string;
  author: string;
  authorTier: Tier;
  avatarColor: string;
  timestamp: string;
  title?: string;
  body: string;
  likes: number;
  replies: {
    id: string;
    author: string;
    avatarColor: string;
    timestamp: string;
    body: string;
  }[];
};

export const CHANNELS: Channel[] = [
  {
    slug: "vorstellung",
    name: "Stell dich vor",
    description: "Neu hier? Sag kurz Hallo und woran du gerade baust.",
    writeTier: "free",
    icon: "hand",
  },
  {
    slug: "offene-fragen",
    name: "Offene Fragen",
    description: "Du hängst fest? Stelle deine Frage — die Community hilft.",
    writeTier: "starter",
    icon: "circle-help",
  },
  {
    slug: "cases",
    name: "Cases & Projekte",
    description: "Zeig, was du gebaut hast, und hol dir Feedback.",
    writeTier: "starter",
    icon: "rocket",
  },
  {
    slug: "wins",
    name: "Wins 🎉",
    description: "Erster Kunde? Website live? Feier deine Erfolge mit uns.",
    writeTier: "starter",
    icon: "trophy",
  },
  {
    slug: "pro-lounge",
    name: "Pro-Lounge",
    description: "Deep Dives, Live-Cases und Q&A — exklusiv für Pro-Mitglieder.",
    writeTier: "pro",
    icon: "crown",
  },
];

/**
 * Beiträge. Leer, bis echte Mitglieder schreiben.
 *
 * Hier standen Beispiel-Beiträge erfundener Personen. Draußen wirkt so
 * etwas wie eine belebte Community, die es noch nicht gibt, deshalb sind
 * sie raus. Ein leerer Kanal ist ehrlicher als ein gefälschter.
 */
export const SEED_POSTS: CommunityPost[] = [];
