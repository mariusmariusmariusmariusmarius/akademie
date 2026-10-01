import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { darfWerkzeuge, stufeFehlt } from "@/lib/api/zugang";
import { findUserByApiKey, findUserByEmail, type User } from "@/lib/auth/users";
import {
  domainVerbinden,
  hostingKonfiguriert,
  MAX_SEITEN_PRO_KONTO,
  SEITEN_DOMAIN,
  seiteEntfernen,
  seitenVon,
  uploadAbschliessen,
  uploadStarten,
} from "@/lib/api/hosting";

/**
 * Hosting-Zentrale der Plattform.
 *
 * GET    → eigene Seiten samt Adresse
 * POST   { aktion: "start",  name, manifest } → Upload-Token + fehlende Hashes
 * POST   { aktion: "fertig", name, jwt, manifest? } → Seite geht live
 * POST   { aktion: "domain", name, domain } → eigene Domain davorhängen
 * DELETE { name } → Seite abschalten
 *
 * Anmeldung: eingeloggte Sitzung (Lektionsseite) ODER Bearer mm_… (Claude).
 * Wie bei /api/dns — der Teilnehmer sieht nie ein Cloudflare-Token.
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

  return NextResponse.json({
    seiten: await seitenVon(user.id),
    frei: MAX_SEITEN_PRO_KONTO - (await seitenVon(user.id)).length,
    domain: SEITEN_DOMAIN,
  });
}

export async function POST(req: NextRequest) {
  const user = await nutzer(req);
  if (!user) return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  if (!darfWerkzeuge(user)) return stufeFehlt();
  if (!hostingKonfiguriert()) {
    return NextResponse.json(
      { fehler: "Hosting-Zentrale ist auf dem Server nicht konfiguriert." },
      { status: 503 }
    );
  }

  let rumpf: { aktion?: string; name?: string; manifest?: unknown; jwt?: string; domain?: string };
  try {
    rumpf = await req.json();
  } catch {
    return NextResponse.json(
      { fehler: 'JSON erwartet: { "aktion": "start" | "fertig", ... }.' },
      { status: 400 }
    );
  }
  if (!rumpf.name) {
    return NextResponse.json(
      { fehler: "Feld name fehlt — nimm deinen Firmennamen, daraus wird die Adresse." },
      { status: 400 }
    );
  }

  if (rumpf.aktion === "start") {
    const { seite, fehler } = await uploadStarten(user.id, rumpf.name, rumpf.manifest);
    if (fehler || !seite) return NextResponse.json({ fehler }, { status: 400 });
    return NextResponse.json({
      ...seite,
      hinweis:
        seite.fehlt === 0
          ? "Cloudflare kennt alle Dateien schon. Schick direkt aktion \"fertig\" mit diesem jwt."
          : `Lad die ${seite.fehlt} Dateien an uploadUrl — je Anfrage ein Eimer aus buckets, ` +
            "Feldname = Hash, Inhalt = base64, Kopfzeile \"Authorization: Bearer <jwt>\". " +
            "Das jwt aus der LETZTEN Antwort schickst du dann als aktion \"fertig\".",
    });
  }

  if (rumpf.aktion === "fertig") {
    const { seite, fehler } = await uploadAbschliessen(
      user.id,
      rumpf.name,
      rumpf.jwt ?? "",
      rumpf.manifest
    );
    if (fehler || !seite) return NextResponse.json({ fehler }, { status: 400 });
    return NextResponse.json({
      seite,
      hinweis: `Deine Seite läuft unter ${seite.adresse}. Für eine Änderung schickst du einfach wieder start und fertig.`,
    });
  }

  if (rumpf.aktion === "domain") {
    if (!rumpf.domain) {
      return NextResponse.json({ fehler: "Feld domain fehlt." }, { status: 400 });
    }
    const { adresse, fehler, eintraege, status, hinweis } = await domainVerbinden(
      user.id,
      rumpf.name,
      rumpf.domain
    );
    if (fehler || !adresse) return NextResponse.json({ fehler }, { status: 400 });

    // Liegt die Domain im Plattform-Konto, ist nach diesem Aufruf alles
    // erledigt. Liegt sie beim Anbieter des Teilnehmers, bekommt er die
    // Einträge zurück, die er dort selbst setzen muss.
    if (eintraege) {
      return NextResponse.json({ adresse, status, eintraege, hinweis });
    }
    return NextResponse.json({
      adresse,
      hinweis:
        "Domain und www zeigen jetzt auf deine Seite. Das Zertifikat braucht ein paar Minuten — " +
        "bis dahin kann der Browser warnen. Deine Mail-Einträge sind unangetastet geblieben.",
    });
  }

  return NextResponse.json(
    { fehler: 'Feld aktion muss "start", "fertig" oder "domain" sein.' },
    { status: 400 }
  );
}

export async function DELETE(req: NextRequest) {
  const user = await nutzer(req);
  if (!user) return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  if (!darfWerkzeuge(user)) return stufeFehlt();

  let rumpf: { name?: string };
  try {
    rumpf = await req.json();
  } catch {
    return NextResponse.json({ fehler: "JSON erwartet: { name }." }, { status: 400 });
  }
  const { ok, fehler } = await seiteEntfernen(user.id, rumpf.name ?? "");
  if (!ok) return NextResponse.json({ fehler }, { status: 400 });
  return NextResponse.json({ ok: true });
}
