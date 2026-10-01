/**
 * Die freie Ressourcen-Seite: alles, was man zum Mitmachen braucht, ohne
 * Account und ohne Bezahlung. Bewusst hier als Datei und nicht im Curriculum —
 * das Curriculum beschreibt Lektionen, das hier ist eine Werkzeugkiste.
 *
 * Regel für neue Einträge: nur was wirklich im Kurs oder in den Videos
 * verwendet wird. Keine Sammlung um der Sammlung willen.
 */

/** Ein Skill, so wie er installiert wird. */
export type SkillEintrag = {
  name: string;
  /** GitHub-Kürzel, z. B. "anthropics/skills" */
  repo: string;
  /** nur nötig, wenn das Paket mehrere Skills enthält */
  skill?: string;
  /** was er kann — eine Zeile, keine Werbesprache */
  text: string;
  /** Detailseite, meist auf skills.sh */
  href?: string;
  /** braucht den persönlichen mm_-Schlüssel aus der Academy */
  schluessel?: boolean;
};

export type SkillGruppe = {
  slug: string;
  titel: string;
  /** kurze Fassung des Titels für die Sprungleiste */
  kurz?: string;
  text: string;
  eintraege: SkillEintrag[];
};

/** Baut den Installationsbefehl — gilt für Mac und Windows gleichermaßen. */
export function installBefehl(e: SkillEintrag) {
  const skill = e.skill ? ` --skill ${e.skill}` : "";
  return `npx skills add ${e.repo}${skill} --global --yes`;
}

export const SETUP = {
  mac: "curl -fsSL https://setup.mariusmueller.media | bash",
  win: "irm https://setup.mariusmueller.media/win | iex",
  /** die kleine Variante, wenn jemand nur Node und find-skills will */
  macKlein: "curl -fsSL https://setup.mariusmueller.media/klein | bash",
  winKlein: "irm https://setup.mariusmueller.media/klein/win | iex",
};

/** Was das Setup an Programmen mitbringt, bevor es an die Skills geht. */
export const SETUP_INHALT = [
  "Node — damit werden die Skills überhaupt erst installiert",
  "git und das GitHub-Werkzeug (gh)",
  "Python 3 mit Beautiful Soup — zum Auslesen von Webseiten",
  "Homebrew auf dem Mac, winget auf Windows",
  "alle Skills von dieser Seite, auf einen Rutsch",
  "WebsiteLoader — lädt eine bestehende Website herunter",
  "imapsync — zieht ein Postfach um (nur Mac)",
];

export type Werkzeug = {
  name: string;
  /** wo es danach liegt bzw. wie man es aufruft */
  datei: string;
  text: string;
  href: string;
  /** wer es gebaut hat — bei fremden Werkzeugen Pflicht */
  herkunft: string;
  /** Hinweis, wenn es nicht auf beiden Systemen mitkommt */
  hinweis?: string;
};

export const WERKZEUGE: Werkzeug[] = [
  {
    name: "WebsiteLoader",
    datei: "~/mm-werkzeuge/websiteloader.py",
    text: "Lädt eine bestehende Website komplett herunter — Texte, Bilder, Struktur. Die Grundlage, wenn du eine alte Seite neu baust, statt bei null anzufangen.",
    href: "https://setup.mariusmueller.media/websiteloader",
    herkunft: "von uns",
  },
  {
    name: "imapsync",
    datei: "imapsync (im Terminal)",
    text: "Zieht ein komplettes Postfach von einem Anbieter zum nächsten um — alle Ordner, alle Mails, ohne dass etwas verloren geht. Brauchst du, wenn ein Kunde die Domain wechselt und die alte Post mitkommen soll.",
    href: "https://imapsync.lamiral.info/",
    herkunft: "von Gilles Lamiral, quelloffen",
    hinweis: "kommt nur im Mac-Setup mit",
  },
];

export const SKILL_GRUPPEN: SkillGruppe[] = [
  {
    slug: "design",
    titel: "Design",
    text: "Ohne diese vier sehen KI-Websites alle gleich aus. Sie geben Claude Schriftpaarungen, Farbpaletten, Abstände und Layout-Regeln an die Hand — statt der immer gleichen Standardeinstellung.",
    eintraege: [
      {
        name: "ui-ux-pro-max",
        repo: "nextlevelbuilder/ui-ux-pro-max-skill",
        skill: "ui-ux-pro-max",
        text: "Der größte der vier: 79 Stilrichtungen, 192 Farbpaletten, 74 Schriftpaarungen, 119 UX-Regeln. Bestimmt, wie eine Seite wirkt.",
        href: "https://www.skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max",
      },
      {
        name: "frontend-design",
        repo: "anthropics/skills",
        skill: "frontend-design",
        text: "Von Anthropic selbst. Sorgt dafür, dass eine Oberfläche nach einer Entscheidung aussieht und nicht nach Vorlage.",
        href: "https://www.skills.sh/anthropics/skills/frontend-design",
      },
      {
        name: "web-design-guidelines",
        repo: "vercel-labs/agent-skills",
        skill: "web-design-guidelines",
        text: "Von Vercel. Die handwerklichen Grundregeln — Kontrast, Zustände, Tastaturbedienung, Barrierefreiheit.",
        href: "https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines",
      },
      {
        name: "designing-beautiful-websites",
        repo: "tristanmanchester/agent-skills",
        skill: "designing-beautiful-websites",
        text: "Zweite Meinung zum Layout: Informationsarchitektur, Nutzerführung, Wireframes vor dem Feinschliff.",
        href: "https://www.skills.sh/tristanmanchester/agent-skills/designing-beautiful-websites",
      },
    ],
  },
  {
    slug: "seo",
    titel: "SEO — 25 Skills auf einmal",
    kurz: "SEO",
    text: "Ein einziger Befehl installiert das komplette Paket. Du rufst nie alle auf einmal auf — Claude greift sich den, der zur Frage passt.",
    eintraege: [
      {
        name: "seo",
        repo: "agricidaniel/claude-seo",
        text: "Der Einstieg: vollständige Analyse einer Seite oder einer ganzen Website.",
      },
      {
        name: "seo-audit",
        repo: "agricidaniel/claude-seo",
        text: "Großes Audit über bis zu 500 Seiten, verteilt auf bis zu 15 Spezialisten, mit Gesundheitswert am Ende.",
      },
      {
        name: "seo-page",
        repo: "agricidaniel/claude-seo",
        text: "Eine einzelne Seite unter der Lupe — Titel, Text, Meta-Angaben, Bilder.",
      },
      {
        name: "seo-technical",
        repo: "agricidaniel/claude-seo",
        text: "Die Technik in neun Bereichen: Crawlbarkeit, Indexierung, Sicherheit, Ladezeit.",
      },
      {
        name: "seo-content",
        repo: "agricidaniel/claude-seo",
        text: "Textqualität und E-E-A-T — und ob KI-Suchen den Text überhaupt zitieren können.",
      },
      {
        name: "seo-content-brief",
        repo: "agricidaniel/claude-seo",
        text: "Fertiges Briefing für einen Artikel: Gliederung, Wortzahlen je Abschnitt, Konkurrenz-Vergleich.",
      },
      {
        name: "seo-plan",
        repo: "agricidaniel/claude-seo",
        text: "Der Fahrplan: was zuerst, was später, was gar nicht.",
      },
      {
        name: "seo-cluster",
        repo: "agricidaniel/claude-seo",
        text: "Gruppiert Suchbegriffe danach, wie Google sie tatsächlich zusammen ausspielt.",
      },
      {
        name: "seo-dataforseo",
        repo: "agricidaniel/claude-seo",
        text: "Echte Zahlen über die DataForSEO-Schnittstelle: Suchvolumen, Schwierigkeit, Absicht.",
      },
      {
        name: "seo-google",
        repo: "agricidaniel/claude-seo",
        text: "Search Console, PageSpeed Insights und CrUX — direkt aus Googles eigenen Daten.",
      },
      {
        name: "seo-local",
        repo: "agricidaniel/claude-seo",
        text: "Lokale Sichtbarkeit: Google-Unternehmensprofil, Einträge, Bewertungen.",
      },
      {
        name: "seo-maps",
        repo: "agricidaniel/claude-seo",
        text: "Rangverfolgung auf der Karte, Raster über das Einzugsgebiet, Bewertungsanalyse.",
      },
      {
        name: "seo-geo",
        repo: "agricidaniel/claude-seo",
        text: "Sichtbarkeit in KI-Antworten — AI Overviews, ChatGPT, Perplexity.",
      },
      {
        name: "seo-schema",
        repo: "agricidaniel/claude-seo",
        text: "Strukturierte Daten erkennen, prüfen und erzeugen (JSON-LD).",
      },
      {
        name: "seo-sitemap",
        repo: "agricidaniel/claude-seo",
        text: "Sitemaps prüfen oder neu bauen.",
      },
      {
        name: "seo-images",
        repo: "agricidaniel/claude-seo",
        text: "Bilder: Alternativtexte, Dateigrößen, Formate, responsive Varianten.",
      },
      {
        name: "seo-image-gen",
        repo: "agricidaniel/claude-seo",
        text: "Erzeugt die Bilder, die SEO braucht — Vorschaubilder für soziale Netzwerke, Beitragsbilder.",
      },
      {
        name: "seo-backlinks",
        repo: "agricidaniel/claude-seo",
        text: "Verweise von außen: verweisende Domains, Ankertexte, schädliche Links, Lücken zur Konkurrenz.",
      },
      {
        name: "seo-competitor-pages",
        repo: "agricidaniel/claude-seo",
        text: "Vergleichsseiten bauen — „X gegen Y“ und „Alternativen zu“.",
      },
      {
        name: "seo-ecommerce",
        repo: "agricidaniel/claude-seo",
        text: "Für Shops: Google Shopping, Amazon, Produktdaten.",
      },
      {
        name: "seo-programmatic",
        repo: "agricidaniel/claude-seo",
        text: "Viele Seiten aus einer Datenquelle erzeugen, ohne dünne Inhalte zu produzieren.",
      },
      {
        name: "seo-hreflang",
        repo: "agricidaniel/claude-seo",
        text: "Mehrsprachige Seiten richtig auszeichnen.",
      },
      {
        name: "seo-sxo",
        repo: "agricidaniel/claude-seo",
        text: "Liest die Suchergebnisse rückwärts: warum eine gut optimierte Seite trotzdem nicht klickt.",
      },
      {
        name: "seo-drift",
        repo: "agricidaniel/claude-seo",
        text: "Vergleicht den Ist-Zustand mit einem früheren Stand und meldet Verschlechterungen.",
      },
      {
        name: "seo-flow",
        repo: "agricidaniel/claude-seo",
        text: "Der FLOW-Ablauf: finden, nutzen, optimieren, gewinnen — mit 41 fertigen Prompts.",
      },
    ],
  },
  {
    slug: "recht",
    titel: "Rechtstexte",
    text: "Deutschland-spezifisch. Der Skill scannt das Projekt, erkennt die eingesetzten Dienste und baut daraus die passenden Seiten.",
    eintraege: [
      {
        name: "rechtstexte-de",
        repo: "mariusmariusmariusmariusmarius/rechtstexte-de",
        text: "Impressum, Datenschutzerklärung, Cookie-Einschätzung, Barrierefreiheits-Check nach BFSG, für Shops auch Widerruf und AGB.",
        href: "https://www.skills.sh/mariusmariusmariusmariusmarius/rechtstexte-de/rechtstexte-de",
      },
    ],
  },
  {
    slug: "bilder",
    titel: "Bilder und Logos",
    text: "Für alle, die weder Fotos noch ein Logo haben — der häufigste Fall bei einer ersten Website.",
    eintraege: [
      {
        name: "nanorealism",
        repo: "mariusmariusmariusmariusmarius/nanorealism",
        text: "Fotorealistische Bilder: Kamera zuerst, dann Licht, Motiv, Pose — plus ein Durchgang für die kleinen Unsauberkeiten, die ein Bild echt wirken lassen.",
        href: "https://www.skills.sh/mariusmariusmariusmariusmarius/nanorealism/nanorealism",
      },
      {
        name: "higgsfield-generate",
        repo: "higgsfield-ai/skills",
        skill: "higgsfield-generate",
        text: "Bilder, Videos und Audio über Higgsfield erzeugen.",
        href: "https://www.skills.sh/higgsfield-ai/skills/higgsfield-generate",
      },
      {
        name: "higgsfield-product-photoshoot",
        repo: "higgsfield-ai/skills",
        skill: "higgsfield-product-photoshoot",
        text: "Produktbilder in Studioqualität — Freisteller, Szenen, Werbemotive.",
        href: "https://www.skills.sh/higgsfield-ai/skills/higgsfield-product-photoshoot",
      },
    ],
  },
  {
    slug: "text",
    titel: "Text",
    text: "Der Unterschied zwischen einer Seite, die beschreibt, und einer, die verkauft.",
    eintraege: [
      {
        name: "copywriting",
        repo: "coreyhaines31/marketingskills",
        skill: "copywriting",
        text: "Überschriften, Nutzenversprechen, Handlungsaufforderungen — für Startseite, Landingpage und Preisseite.",
        href: "https://www.skills.sh/coreyhaines31/marketingskills/copywriting",
      },
    ],
  },
  {
    slug: "grundlage",
    titel: "Grundlage",
    text: "Der eine Skill, mit dem Claude sich alle weiteren selbst sucht.",
    eintraege: [
      {
        name: "find-skills",
        repo: "vercel-labs/skills",
        text: "Von Vercel. Claude durchsucht damit die Skill-Bibliothek und installiert, was zur Aufgabe passt — du musst keine Namen auswendig kennen.",
        href: "https://www.skills.sh/vercel-labs/skills/find-skills",
      },
    ],
  },
  {
    slug: "academy",
    titel: "Academy-Skills",
    text: "Diese beiden laufen über die Academy — installieren kann sie jeder, benutzen nur mit einem persönlichen mm_-Schlüssel. Dahinter stehen kostenpflichtige Schnittstellen, die wir für Mitglieder bündeln.",
    eintraege: [
      {
        name: "akademie-seo-daten",
        repo: "mariusmariusmariusmariusmarius/akademie-seo-daten",
        text: "SEO- und Marktdaten ohne eigenes DataForSEO-Konto: Rankings, Suchvolumen, Wettbewerber, Backlinks, KI-Sichtbarkeit.",
        href: "https://github.com/mariusmariusmariusmariusmarius/akademie-seo-daten",
        schluessel: true,
      },
      {
        name: "domain-mail-automation",
        repo: "mariusmariusmariusmariusmarius/domain-mail-automation",
        text: "Domain anschließen, DNS setzen, Postfächer anlegen, Bewertungen abrufen — alles aus Claude heraus.",
        href: "https://github.com/mariusmariusmariusmariusmarius/domain-mail-automation",
        schluessel: true,
      },
    ],
  },
];

/** Alle Skills gezählt, für die Kopfzeile der Seite. */
export const SKILL_ANZAHL = SKILL_GRUPPEN.reduce(
  (summe, gruppe) => summe + gruppe.eintraege.length,
  0,
);
