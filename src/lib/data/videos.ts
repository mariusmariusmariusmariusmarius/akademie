import { getLesson } from "@/lib/data/curriculum";
import type { CheatSheet } from "@/lib/data/curriculum";

/** Ein Prompt-Block, so wie ihn die Lektion liefert. */
export type Prompt = NonNullable<CheatSheet["prompts"]>[number];

/**
 * Zu jedem YouTube-Video eine eigene Seite unter /ressourcen/<slug>:
 * Kapitel für Kapitel, was passiert — und die Prompts dazu zum Kopieren.
 *
 * Die Prompts stehen NICHT hier, sondern werden aus dem Curriculum geholt.
 * Grund: sie werden dort gepflegt, und ein Prompt, der an zwei Stellen liegt,
 * ist nach dem zweiten Kurs-Update falsch.
 */

/** Verweis auf die Prompts einer Kurs-Lektion. */
export type PromptQuelle = {
  modul: string;
  lektion: string;
  /** nur Prompts, deren Beschriftung einen dieser Teile enthält */
  nur?: string[];
  /** Prompts, deren Beschriftung einen dieser Teile enthält, weglassen */
  ohne?: string[];
};

export type VideoKapitel = {
  /** Anker in der Adresse und in der Sprungleiste */
  id: string;
  /** Zeitmarke im Video, z. B. "5:15" */
  zeit: string;
  titel: string;
  /** Der Fließtext — je Eintrag ein Absatz */
  text: string[];
  quellen?: PromptQuelle[];
  /**
   * Prompts, die nur zu diesem Video gehören und keine Kurs-Lektion als
   * Quelle haben. Das YouTube-Video hostet bei Cloudflare Pages, die
   * Kurs-Lektionen zeigen noch die Vercel-Aufnahme — das sind zwei
   * verschiedene Prompts, keine Kopie voneinander.
   */
  prompts?: Prompt[];
  links?: { label: string; href: string; note?: string }[];
  /** steht statt der Prompts da, wenn es in diesem Kapitel keine gibt */
  keinPrompt?: string;
};

export type Video = {
  slug: string;
  nummer: number;
  titel: string;
  /** eine Zeile für die Übersichtskarte */
  kurz: string;
  /** Einleitung oben auf der Seite */
  einleitung: string[];
  /** die elf Zeichen aus der YouTube-Adresse — fehlt, solange nicht online */
  youtubeId?: string;
  dauer: string;
  kapitel: VideoKapitel[];
};

/**
 * Der Setup-Befehl steht im Kurs in fast jeder Lektion als Rückfalloption.
 * Auf der Videoseite hat er genau einen Platz — Kapitel 2 — und wäre überall
 * sonst nur Rauschen.
 */
const IMMER_WEG = ["Setup übersprungen"];

const passt = (label: string, teile: string[]) =>
  teile.some((teil) => label.toLowerCase().includes(teil.toLowerCase()));

/** Holt die Prompts einer Lektion, gefiltert nach `nur` und `ohne`. */
export function promptsAus(quelle: PromptQuelle): Prompt[] {
  const treffer = getLesson(quelle.modul, quelle.lektion);
  const prompts = treffer?.lesson.cheatSheet?.prompts ?? [];
  const weg = [...IMMER_WEG, ...(quelle.ohne ?? [])];
  return prompts.filter((p) => {
    const label = p.label ?? "";
    if (passt(label, weg)) return false;
    return quelle.nur ? passt(label, quelle.nur) : true;
  });
}

// Die Video-Module. Die Lektionen des früheren Modul 1 liegen jetzt in
// fünf Blöcken, deshalb je Block eine eigene Konstante.
const M1 = "modul-1-basics";
const M2 = "modul-2-inhalt-und-design";
const M3 = "modul-3-online-gehen";
const M5 = "modul-5-gefunden-werden";

// Code-Einblick: Die Videoseiten mit ihren Kapiteln und Prompts sind hier nicht enthalten.
export const VIDEOS: Video[] = [];

export function getVideo(slug: string) {
  return VIDEOS.find((v) => v.slug === slug);
}
