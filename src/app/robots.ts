import type { MetadataRoute } from "next";
import { PLATTFORM_URL } from "@/lib/config";

/**
 * robots.txt der Academy.
 *
 * Gesperrt wird alles, was hinter dem Login liegt oder für einen
 * Crawler wertlos ist. Das ist keine Zugangssicherung — die steckt in
 * der Anwendung —, sondern verhindert, dass Google Zeit auf Seiten
 * verschwendet, die ihm nur eine Anmeldemaske zeigen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/kurse",
        "/community",
        "/admin",
        "/einstellungen",
        "/login",
        "/registrieren",
        "/passwort-vergessen",
        "/api/",
      ],
    },
    sitemap: `${PLATTFORM_URL}/sitemap.xml`,
    host: PLATTFORM_URL,
  };
}
