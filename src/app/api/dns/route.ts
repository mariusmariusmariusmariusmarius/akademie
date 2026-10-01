import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { darfWerkzeuge, stufeFehlt } from "@/lib/api/zugang";
import { findUserByApiKey, findUserByEmail, type User } from "@/lib/auth/users";
import {
  dnsKonfiguriert,
  domainsVonSicher,
  tokenNeuErzeugen,
  zoneAnlegen,
  zoneEntfernen,
  zonenStatus,
} from "@/lib/api/dns";

/**
 * DNS-Zentrale der Plattform.
 *
 * GET    → eigene Domains (Nameserver, Token, Live-Status)
 * POST   { domain } → Zone anlegen, Nameserver + Token zurück
 * DELETE { domain } → Not-Aus: Zone samt Token entfernen
 *
 * Anmeldung: eingeloggte Sitzung (Lektionsseite) ODER Bearer mm_… (Claude).
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

  const liste = await Promise.all(
    (await domainsVonSicher(user.id)).map(async (d) => ({
      domain: d.domain,
      nameServers: d.nameServers,
      token: d.token,
      status: await zonenStatus(d.zoneId),
      angelegt: d.angelegt,
    }))
  );
  return NextResponse.json({ domains: liste });
}

export async function POST(req: NextRequest) {
  const user = await nutzer(req);
  if (!user) return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  if (!darfWerkzeuge(user)) return stufeFehlt();
  if (!dnsKonfiguriert()) {
    return NextResponse.json(
      { fehler: "DNS-Zentrale ist auf dem Server nicht konfiguriert." },
      { status: 503 }
    );
  }

  let rumpf: { domain?: string; tokenNeu?: boolean };
  try {
    rumpf = await req.json();
  } catch {
    return NextResponse.json({ fehler: "JSON erwartet: { domain }." }, { status: 400 });
  }
  if (!rumpf.domain) {
    return NextResponse.json({ fehler: "Feld domain fehlt." }, { status: 400 });
  }

  if (rumpf.tokenNeu) {
    const { eintrag, fehler } = await tokenNeuErzeugen(user.id, rumpf.domain);
    if (fehler || !eintrag) return NextResponse.json({ fehler }, { status: 400 });
    return NextResponse.json({
      domain: eintrag.domain,
      token: eintrag.token,
      hinweis: "Neues Token erzeugt. Ein früher erzeugtes Token bleibt gültig.",
    });
  }

  const { eintrag, fehler } = await zoneAnlegen(user.id, rumpf.domain);
  if (fehler || !eintrag) {
    return NextResponse.json({ fehler }, { status: 400 });
  }
  return NextResponse.json({
    domain: eintrag.domain,
    nameServers: eintrag.nameServers,
    token: eintrag.token,
    hinweis:
      "Trag die zwei Nameserver bei deinem Registrar ein. Sobald der Status auf active springt, kann Claude mit dem Token deine DNS-Einträge verwalten.",
  });
}

export async function DELETE(req: NextRequest) {
  const user = await nutzer(req);
  if (!user) return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  if (!darfWerkzeuge(user)) return stufeFehlt();

  let rumpf: { domain?: string };
  try {
    rumpf = await req.json();
  } catch {
    return NextResponse.json({ fehler: "JSON erwartet: { domain }." }, { status: 400 });
  }
  const { ok, fehler } = await zoneEntfernen(user.id, rumpf.domain ?? "");
  if (!ok) return NextResponse.json({ fehler }, { status: 400 });
  return NextResponse.json({ ok: true });
}
