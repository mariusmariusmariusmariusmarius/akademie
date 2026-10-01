import type { Tier } from "@/lib/tiers";

/**
 * Das Curriculum der Plattform — Stand: Lehrplan v1 (docs/lehrplan.md),
 * geschmiedet aus Marius' Fragebogen-Antworten.
 * Aktuell statisch als Gerüst — später kommt das aus der Datenbank (Neon)
 * und wird über den Admin-Bereich gepflegt.
 */

/**
 * Die Info-Box rechts neben dem Video: bewusst nur Handwerkszeug —
 * Prompts zum Kopieren und die Links, wo es raufgeht. Erklärt wird im Video.
 */
export type CheatSheet = {
  /** zeigt oben in der Box den persönlichen API-Schlüssel des Nutzers */
  apiKeyHint?: boolean;
  /** label steht ÜBER dem Block — im kopierbaren Text steht nur der Prompt.
   *  os blendet ein Apple- bzw. Windows-Zeichen davor ein. */
  prompts?: { label?: string; os?: "mac" | "win"; text: string }[];
  links?: { label: string; href: string; note?: string }[];
  /** Ersetzt den Platzhalter, wenn es in dieser Lektion bewusst nichts gibt */
  emptyNote?: string;
};

export type Lesson = {
  slug: string;
  title: string;
  description: string;
  /** Die Schritte der Lektion in Stichpunkten — steht unter dem Video */
  steps?: string[];
  /** Minuten, rein informativ */
  duration: number;
  kind: "video" | "text" | "case";
  /** Pfad zum Kursvideo (unter public/), z. B. "/videos/modul-1/….mp4" */
  videoUrl?: string;
  /** zeigt die Schriftarten-Übersicht unter „Worum geht's?" */
  fontSchau?: boolean;
  /** zeigt das Domain-Anschließen-Feld (DNS-Zentrale) */
  dnsTool?: boolean;
  /** zeigt die Wunschdomain-Abfrage (frei / vergeben) */
  domainCheck?: boolean;
  /** zeigt den Baukasten für den Versand-Prompt (nutzt die eigenen Postfächer) */
  mailPrompt?: boolean;
  /** zeigt den Resend-Baukasten (Adressen von Hand eintragen) */
  resendPrompt?: boolean;
  /** zeigt den Audit-Prompt mit Einzugsgebiets-Regler */
  seoPrompt?: boolean;
  cheatSheet?: CheatSheet;
};

export type CourseModule = {
  slug: string;
  title: string;
  subtitle: string;
  /** Mindest-Stufe, um das Modul zu öffnen */
  tier: Tier;
  /** Name eines lucide-Icons, Zuordnung in components/icon-map */
  icon: string;
  /** Tailwind-Gradient für die Modul-Karte */
  gradient: string;
  /**
   * Zusammengehörige Modul-Reihe. Nur innerhalb einer Reihe wird am Ende
   * eines Moduls automatisch ins nächste weitergeleitet — sonst landete man
   * nach Modul 5 in der alten Planung.
   */
  serie?: string;
  /**
   * Nur im Adminbereich sichtbar. Für Module, deren Videos noch nicht
   * gedreht sind: sie bleiben als Planung im Code, tauchen aber weder auf
   * der Startseite noch im Mitgliederbereich auf.
   */
  nurAdmin?: boolean;
  lessons: Lesson[];
};

export const CURRICULUM: CourseModule[] = [
  // Code-Einblick: Die echten Kursinhalte (Lektionen, Prompts, Videos) sind
  // hier bewusst nicht enthalten. Ein Beispielmodul zeigt nur die Struktur.
  {
    slug: "beispiel-modul",
    title: "Beispielmodul",
    subtitle: "Platzhalter – die echten Inhalte gibt es nur in der Akademie",
    tier: "starter",
    icon: "Rocket",
    gradient: "from-violet-500 to-fuchsia-500",
    lessons: [
      {
        slug: "beispiel-lektion",
        title: "Beispiel-Lektion",
        description: "Hier stehen in der echten Akademie Video, Schritte und Prompts.",
        duration: 5,
        kind: "text",
      },
    ],
  },
];

/**
 * Was Teilnehmer zu sehen bekommen. Module in Planung sind hier raus.
 * Der Adminbereich arbeitet weiter mit CURRICULUM und sieht alles.
 */
export const SICHTBARE_MODULE: CourseModule[] = CURRICULUM.filter(
  (m) => !m.nurAdmin
);

/** Darf dieser Nutzer das Modul überhaupt sehen? */
export function modulSichtbar(
  modul: CourseModule,
  rolle: string | undefined
): boolean {
  return !modul.nurAdmin || rolle === "admin";
}

export function getModule(slug: string): CourseModule | undefined {
  return CURRICULUM.find((m) => m.slug === slug);
}

export function getLesson(
  moduleSlug: string,
  lessonSlug: string
): { module: CourseModule; lesson: Lesson; index: number } | undefined {
  const courseModule = getModule(moduleSlug);
  if (!courseModule) return undefined;
  const index = courseModule.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return undefined;
  return { module: courseModule, lesson: courseModule.lessons[index], index };
}

/** Lektionen aller Module, auch der versteckten. Für den Adminbereich. */
export function alleLektionen(): number {
  return CURRICULUM.reduce((n, m) => n + m.lessons.length, 0);
}

/** Lektionen, die Teilnehmer sehen. Versteckte Module zählen nicht mit. */
export function totalLessons(): number {
  return SICHTBARE_MODULE.reduce((sum, m) => sum + m.lessons.length, 0);
}

/**
 * Nachbarmodul innerhalb derselben Reihe. Damit läuft der Kurs am Ende
 * eines Moduls weiter, statt in einer Sackgasse zu enden.
 */
export function nachbarModul(
  slug: string,
  richtung: 1 | -1
): CourseModule | undefined {
  const i = CURRICULUM.findIndex((m) => m.slug === slug);
  if (i < 0 || !CURRICULUM[i].serie) return undefined;
  const nachbar = CURRICULUM[i + richtung];
  return nachbar?.serie === CURRICULUM[i].serie ? nachbar : undefined;
}
