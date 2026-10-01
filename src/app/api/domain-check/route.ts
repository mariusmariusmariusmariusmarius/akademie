import { NextRequest, NextResponse } from "next/server";

/**
 * Domain-Verfügbarkeit über RDAP — das offizielle Auskunftsprotokoll der
 * Registrierungsstellen (Nachfolger von Whois).
 *
 * Wir fragen die zuständige Stelle DIREKT: Die IANA veröffentlicht ein
 * Verzeichnis, welche Endung zu welchem RDAP-Server gehört. Der Umweg über
 * Sammeldienste wie rdap.org war unzuverlässig (mal Zeitüberschreitung, mal
 * falsche Antwort bei .de).
 *
 * 404 heißt: nicht registriert, also frei.
 *
 * Zusätzlich schlagen wir freie Alternativen vor — andere Endungen und
 * gängige Namensvarianten —, damit niemand vor einem „vergeben" steht und
 * nicht weiterweiß.
 */

/**
 * Endungen, die im IANA-Verzeichnis fehlen — die Länderstellen melden ihre
 * RDAP-Server dort teils nicht. Hier direkt eintragen; alle drei geprüft:
 * vergebene Domain → 200, freie → 404.
 */
const EIGENE: Record<string, string> = {
  de: "https://rdap.denic.de",
  ch: "https://rdap.nic.ch",
  li: "https://rdap.nic.li",
};

/** Endungen für Vorschläge, in der Reihenfolge, in der wir sie empfehlen */
const ENDUNGEN = ["de", "com", "net", "online", "info", "shop"];

type Verzeichnis = Map<string, string>;
let verzeichnis: Verzeichnis | null = null;
let geladenAm = 0;

/** IANA-Verzeichnis holen und einen Tag lang behalten */
async function holeVerzeichnis(): Promise<Verzeichnis> {
  const einTag = 24 * 60 * 60 * 1000;
  if (verzeichnis && Date.now() - geladenAm < einTag) return verzeichnis;

  const r = await fetch("https://data.iana.org/rdap/dns.json", {
    signal: AbortSignal.timeout(8_000),
  });
  const d = (await r.json()) as { services: [string[], string[]][] };
  const karte: Verzeichnis = new Map();
  for (const [endungen, server] of d.services) {
    for (const e of endungen) {
      if (server[0]) karte.set(e.toLowerCase(), server[0].replace(/\/$/, ""));
    }
  }
  verzeichnis = karte;
  geladenAm = Date.now();
  return karte;
}

function saubere(roh: string): string {
  return roh
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "") // „www.meine-firma.de" ist keine eigene Domain
    .replace(/\.$/, "");
}

type Status = "frei" | "vergeben" | "unbekannt";

async function pruefe(
  domain: string,
  zeit = 9_000
): Promise<{ status: Status; ablauf: string | null }> {
  const endung = domain.slice(domain.lastIndexOf(".") + 1);

  let basis: string | undefined = EIGENE[endung];
  try {
    if (!basis) basis = (await holeVerzeichnis()).get(endung);
  } catch {
    // Verzeichnis nicht erreichbar — unten fällt es auf rdap.org zurück
  }

  const quellen = [
    basis ? `${basis}/domain/${encodeURIComponent(domain)}` : null,
    `https://rdap.org/domain/${encodeURIComponent(domain)}`,
  ].filter(Boolean) as string[];

  for (const quelle of quellen) {
    let antwort: Response;
    try {
      antwort = await fetch(quelle, {
        redirect: "follow",
        headers: { Accept: "application/rdap+json" },
        signal: AbortSignal.timeout(zeit),
      });
    } catch {
      continue; // nächste Quelle probieren
    }

    if (antwort.status === 404) return { status: "frei", ablauf: null };
    if (antwort.ok) {
      let ablauf: string | null = null;
      try {
        const d = (await antwort.json()) as {
          events?: { eventAction: string; eventDate: string }[];
        };
        ablauf =
          d.events
            ?.find((e) => e.eventAction === "expiration")
            ?.eventDate?.slice(0, 10) ?? null;
      } catch {
        // Auskunft ohne lesbares JSON — der Status reicht
      }
      return { status: "vergeben", ablauf };
    }
    // 429/5xx: nächste Quelle probieren
  }
  return { status: "unbekannt", ablauf: null };
}

/** Kandidaten für Vorschläge bauen — andere Endungen und Namensvarianten */
function kandidaten(domain: string): string[] {
  const punkt = domain.indexOf(".");
  const name = domain.slice(0, punkt);
  const endung = domain.slice(punkt + 1);

  const namen = new Set<string>([name]);
  if (name.includes("-")) namen.add(name.replace(/-/g, "")); // ohne Bindestriche
  namen.add(`${name}24`); // im Handwerk sehr verbreitet
  namen.add(`${name}-online`);

  const liste: string[] = [];
  // erst der eigene Name mit anderen Endungen — das ist der beste Vorschlag
  for (const e of ENDUNGEN) {
    if (e !== endung) liste.push(`${name}.${e}`);
  }
  // dann Namensvarianten mit der ursprünglichen Endung
  for (const n of namen) {
    if (n !== name) liste.push(`${n}.${endung}`);
  }
  return liste.filter((d) => d !== domain).slice(0, 9);
}

export async function GET(req: NextRequest) {
  const domain = saubere(req.nextUrl.searchParams.get("domain") ?? "");

  if (!/^[a-z0-9äöüß-]+(\.[a-z0-9-]+)+$/.test(domain)) {
    return NextResponse.json(
      { fehler: "Das sieht nicht wie eine Domain aus. Beispiel: meine-firma.de" },
      { status: 400 }
    );
  }

  try {
    const { status, ablauf } = await pruefe(domain);

    // Vorschläge parallel prüfen — kürzere Frist, sie sind nur Beiwerk
    const geprueft = await Promise.all(
      kandidaten(domain).map(async (d) => ({
        domain: d,
        status: (await pruefe(d, 6_000).catch(() => ({ status: "unbekannt" as Status })))
          .status,
      }))
    );
    const alternativen = geprueft
      .filter((a) => a.status === "frei")
      .map((a) => a.domain)
      .slice(0, 6);

    return NextResponse.json({ domain, status, ablauf, alternativen });
  } catch {
    return NextResponse.json({ domain, status: "unbekannt", alternativen: [] });
  }
}
