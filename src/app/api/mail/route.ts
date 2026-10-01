import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { darfWerkzeuge, stufeFehlt } from "@/lib/api/zugang";
import { findUserByApiKey, findUserByEmail, type User } from "@/lib/auth/users";
import {
  aliasAnlegen,
  domainAnlegen,
  gehoertNutzer,
  mailDomainsVon,
  mailKonfiguriert,
  postfachAendern,
  postfachAnlegen,
  postfachLoeschen,
  postfaecherVon,
  domainRecords,
  domainAktivieren,
  TAGESLIMIT,
} from "@/lib/api/mail";

/**
 * Postfach-Zentrale der Plattform.
 *
 * GET    → eigene Mail-Domains samt Postfächern
 * POST   { aktion: "domain",   domain }
 *        { aktion: "postfach", domain, adresse, name, passwort }
 *        { aktion: "alias",    domain, alias, ziele: [...] }
 *        { aktion: "passwort", domain, adresse, neuesPasswort }
 *        { aktion: "records",   domain }   → geforderte DNS-Einträge
 *        { aktion: "aktivieren",domain }   → Domain freischalten
 * DELETE { domain, adresse }
 *
 * Anmeldung: eingeloggte Sitzung ODER Bearer mm_… (damit Claude es kann).
 * Der Migadu-Schlüssel bleibt auf dem Server — Teilnehmer sehen ihn nie.
 */

async function nutzer(req: NextRequest): Promise<User | null> {
  const kopf = req.headers.get("authorization") ?? "";
  if (kopf.startsWith("Bearer mm_")) {
    return (await findUserByApiKey(kopf.slice(7).trim())) ?? null;
  }
  const session = await getSession();
  if (session) return (await findUserByEmail(session.email)) ?? null;
  return null;
}

export async function GET(req: NextRequest) {
  const user = await nutzer(req);
  if (!user) return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  if (!darfWerkzeuge(user)) return stufeFehlt();

  const meine = await mailDomainsVon(user.id);
  const domains = await Promise.all(
    meine.map(async (d) => ({
      domain: d.domain,
      angelegt: d.angelegt,
      state: d.state ?? "",
      postfaecher: await postfaecherVon(d.domain).catch(() => []),
    }))
  );
  return NextResponse.json({ domains, tageslimit: TAGESLIMIT });
}

export async function POST(req: NextRequest) {
  const user = await nutzer(req);
  if (!user) return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  if (!darfWerkzeuge(user)) return stufeFehlt();
  if (!mailKonfiguriert()) {
    return NextResponse.json(
      { fehler: "Postfach-Zentrale ist auf dem Server nicht konfiguriert." },
      { status: 503 }
    );
  }

  let b: {
    aktion?: string;
    domain?: string;
    adresse?: string;
    name?: string;
    passwort?: string;
    alias?: string;
    ziele?: string[];
    neuesPasswort?: string;
  };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ fehler: "JSON erwartet." }, { status: 400 });
  }

  const domain = (b.domain ?? "").trim().toLowerCase();

  if (b.aktion === "domain") {
    const { domain: neu, fehler } = await domainAnlegen(user.id, domain);
    if (fehler) return NextResponse.json({ fehler }, { status: 400 });
    return NextResponse.json({
      domain: neu,
      hinweis:
        "Die Domain ist angelegt und wird aktiv, sobald MX, SPF und DKIM gesetzt sind. Wenn deine DNS bei uns liegt, kann Claude das direkt erledigen.",
    });
  }

  // Alles Weitere setzt voraus, dass die Domain dem Konto gehört
  if (!(await gehoertNutzer(user.id, domain))) {
    return NextResponse.json(
      { fehler: "Diese Domain gehört nicht zu deinem Konto." },
      { status: 403 }
    );
  }

  if (b.aktion === "postfach") {
    if (!b.adresse || !b.passwort) {
      return NextResponse.json(
        { fehler: "adresse und passwort werden gebraucht." },
        { status: 400 }
      );
    }
    if (b.passwort.length < 12) {
      return NextResponse.json(
        { fehler: "Das Passwort muss mindestens 12 Zeichen haben." },
        { status: 400 }
      );
    }
    const { adresse, fehler } = await postfachAnlegen(
      domain,
      b.adresse.split("@")[0],
      b.name ?? b.adresse,
      b.passwort
    );
    if (fehler) return NextResponse.json({ fehler }, { status: 400 });
    return NextResponse.json({ adresse, tageslimit: TAGESLIMIT });
  }

  if (b.aktion === "alias") {
    if (!b.alias || !b.ziele?.length) {
      return NextResponse.json({ fehler: "alias und ziele werden gebraucht." }, { status: 400 });
    }
    const { adresse, fehler } = await aliasAnlegen(
      domain,
      b.alias.split("@")[0],
      b.ziele
    );
    if (fehler) return NextResponse.json({ fehler }, { status: 400 });
    return NextResponse.json({ adresse });
  }

  if (b.aktion === "passwort") {
    if (!b.adresse || !b.neuesPasswort) {
      return NextResponse.json(
        { fehler: "adresse und neuesPasswort werden gebraucht." },
        { status: 400 }
      );
    }
    const { adresse, fehler } = await postfachAendern(
      domain,
      b.adresse.split("@")[0],
      { passwort: b.neuesPasswort }
    );
    if (fehler) return NextResponse.json({ fehler }, { status: 400 });
    return NextResponse.json({ adresse, geaendert: true });
  }

  if (b.aktion === "records") {
    const records = await domainRecords(domain);
    if (!records) return NextResponse.json({ fehler: "Konnte die Einträge nicht laden." }, { status: 400 });
    return NextResponse.json({ records });
  }

  if (b.aktion === "aktivieren") {
    const { state, fehler } = await domainAktivieren(domain);
    if (fehler) return NextResponse.json({ fehler }, { status: 400 });
    return NextResponse.json({ state });
  }

  return NextResponse.json(
    { fehler: 'aktion muss "domain", "postfach", "passwort", "alias", "records" oder "aktivieren" sein.' },
    { status: 400 }
  );
}

export async function DELETE(req: NextRequest) {
  const user = await nutzer(req);
  if (!user) return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  if (!darfWerkzeuge(user)) return stufeFehlt();

  let b: { domain?: string; adresse?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ fehler: "JSON erwartet." }, { status: 400 });
  }
  const domain = (b.domain ?? "").trim().toLowerCase();
  if (!(await gehoertNutzer(user.id, domain))) {
    return NextResponse.json(
      { fehler: "Diese Domain gehört nicht zu deinem Konto." },
      { status: 403 }
    );
  }
  if (!b.adresse) {
    return NextResponse.json({ fehler: "adresse fehlt." }, { status: 400 });
  }
  const ok = await postfachLoeschen(domain, b.adresse.split("@")[0]);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ fehler: "Löschen fehlgeschlagen." }, { status: 400 });
}
