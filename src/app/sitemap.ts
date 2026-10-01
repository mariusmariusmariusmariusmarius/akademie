import type { MetadataRoute } from "next";
import { PLATTFORM_URL } from "@/lib/config";
import { VIDEOS } from "@/lib/data/videos";

/**
 * Sitemap der Academy — bewusst nur die öffentlichen Seiten.
 *
 * Alles hinter dem Login (Dashboard, Kurse, Community, Admin,
 * Einstellungen) gehört NICHT hier hinein: Ein Crawler bekommt dort
 * keinen Inhalt zu sehen, und leere oder dünne Seiten schlagen auf die
 * Bewertung der ganzen Domain durch. Die robots.txt sperrt sie
 * zusätzlich aus.
 */
/**
 * Wann die Seite zuletzt inhaltlich geändert wurde — ein echtes Datum.
 *
 * Bis zum 10.09.2026 stand hier `new Date()`, also der Zeitpunkt des Abrufs.
 * Google sah dadurch bei jedem Besuch „alle neun Seiten haben sich gerade
 * geändert", holte sie, fand denselben Text und lernte, dass die Angabe bei
 * dieser Domain nichts wert ist. Zu dem Zeitpunkt stand eine von neun Seiten
 * im Index. Ein Datum, das manchmal alt ist, ist mehr wert als eines, das
 * immer heute ist.
 *
 * Wer eine Seite so ändert, dass ein Leser es merkt, zieht ihr Datum nach.
 */
const STAND: Record<string, string> = {
  "/": "2026-09-08",
  "/ressourcen": "2026-09-08",
  "/impressum": "2026-09-03",
  "/datenschutz": "2026-09-09",
  "/agb": "2026-09-08",
  "/widerruf": "2026-09-08",
  "/kuendigen": "2026-09-08",
};

/** Mittags, damit das Datum in jeder Zeitzone auf dem gemeinten Tag landet. */
const amTag = (tag: string) => new Date(`${tag}T12:00:00Z`);

export default function sitemap(): MetadataRoute.Sitemap {
  const seiten: MetadataRoute.Sitemap = [
    { url: PLATTFORM_URL, changeFrequency: "weekly", priority: 1, lastModified: amTag(STAND["/"]) },
    // `/funnel` steht bewusst nicht hier: Das ist die Landingpage für
    // Anzeigen und Link-in-Bio — Quiz, Ergebnis, ein Knopf, sonst nichts.
    // Sie holt ihren Verkehr aus bezahlter Werbung, nicht aus der Suche, und
    // liefert absichtlich keinen Fließtext aus. In der Sitemap stand sie
    // trotzdem und zählte als Seite, die Google aufnehmen soll — so wurde
    // aus einer bewussten Entscheidung eine offene Baustelle.
    { url: `${PLATTFORM_URL}/ressourcen`, changeFrequency: "weekly", priority: 0.8, lastModified: amTag(STAND["/ressourcen"]) },
    ...VIDEOS.map((video) => ({
      url: `${PLATTFORM_URL}/ressourcen/${video.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      // Videoseiten ändern sich mit ihrem Video, nicht mit dem Deploy.
      lastModified: amTag(STAND[`/ressourcen/${video.slug}`] ?? "2026-09-08"),
    })),
    ...(["/impressum", "/datenschutz", "/agb", "/widerruf", "/kuendigen"] as const).map((pfad) => ({
      url: `${PLATTFORM_URL}${pfad}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
      lastModified: amTag(STAND[pfad]),
    })),
  ];

  return seiten;
}
