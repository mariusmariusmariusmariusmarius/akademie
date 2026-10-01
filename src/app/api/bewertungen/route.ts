import { NextRequest, NextResponse } from "next/server";
import { findUserByApiKey } from "@/lib/auth/users";
import { LIMIT_USD, verbrauchBuchen, verbrauchVon } from "@/lib/api/verbrauch";
import { darfWerkzeuge, stufeFehlt } from "@/lib/api/zugang";

/**
 * Bewertungs-API: Weiterleitung an DataForSEO mit persönlichem mm_-Schlüssel.
 *
 * Die Teilnehmer sehen nie die echten DataForSEO-Zugangsdaten — die liegen
 * nur hier auf dem Server. Jede Antwort von DataForSEO nennt ihre Kosten im
 * Feld `cost`; das wird pro Account im Verbrauchsbuch aufsummiert und über
 * das Monatslimit der Stufe gedeckelt.
 *
 * POST  { pfad: "business_data/… | on_page/… | dataforseo_labs/… | keywords_data/…", daten: [...] }
 * GET   → eigener Verbrauch (Monat, Anfragen, Kosten, Limit)
 * Auth  Authorization: Bearer mm_…
 */

/**
 * Erlaubte DataForSEO-Bereiche — Weißliste. Gesperrt bleiben nur:
 *   appendix   (Kontodaten/Guthaben des Plattform-Kontos)
 *   databases  (Massen-Datenbankexporte, Enterprise)
 * Alles andere ist offen; die Monatslimits je Stufe deckeln den Verbrauch.
 */
const ERLAUBTE_PFADE =
  /^(business_data|on_page|dataforseo_labs|keywords_data|serp|ai_optimization|domain_analytics|backlinks|content_analysis|merchant|app_data|dataforseo_trends)\/[a-z0-9_/.-]+$/;

function basicAuth(): string | null {
  const b64 = process.env.DATAFORSEO_B64;
  if (b64) return `Basic ${b64}`;
  const login = process.env.DATAFORSEO_LOGIN;
  const pass = process.env.DATAFORSEO_PASSWORD;
  if (login && pass)
    return `Basic ${Buffer.from(`${login}:${pass}`).toString("base64")}`;
  return null;
}

async function nutzerAusAnfrage(req: NextRequest) {
  const kopf = req.headers.get("authorization") ?? "";
  const key = kopf.startsWith("Bearer ") ? kopf.slice(7).trim() : "";
  if (!key.startsWith("mm_")) return null;
  return (await findUserByApiKey(key)) ?? null;
}

export async function GET(req: NextRequest) {
  const nutzer = await nutzerAusAnfrage(req);
  if (!nutzer) {
    return NextResponse.json(
      { fehler: "Ungültiger oder fehlender API-Schlüssel (Bearer mm_…)." },
      { status: 401 }
    );
  }
  if (!darfWerkzeuge(nutzer)) return stufeFehlt();
  const v = verbrauchVon(nutzer.id);
  return NextResponse.json({
    konto: nutzer.email,
    monat: v.monat,
    anfragen: v.anfragen,
    kostenUsd: Number(v.kostenUsd.toFixed(4)),
    limitUsd: LIMIT_USD[nutzer.tier],
  });
}

export async function POST(req: NextRequest) {
  const nutzer = await nutzerAusAnfrage(req);
  if (!nutzer) {
    return NextResponse.json(
      { fehler: "Ungültiger oder fehlender API-Schlüssel (Bearer mm_…)." },
      { status: 401 }
    );
  }
  if (!darfWerkzeuge(nutzer)) return stufeFehlt();

  const auth = basicAuth();
  if (!auth) {
    return NextResponse.json(
      { fehler: "Bewertungs-API ist auf dem Server nicht konfiguriert." },
      { status: 503 }
    );
  }

  const verbrauch = verbrauchVon(nutzer.id);
  const limit = LIMIT_USD[nutzer.tier];
  if (verbrauch.kostenUsd >= limit) {
    return NextResponse.json(
      {
        fehler: `Monatslimit erreicht (${limit} USD in Stufe ${nutzer.tier}). Meld dich bei uns, wenn du mehr brauchst.`,
        verbrauch,
      },
      { status: 429 }
    );
  }

  let rumpf: { pfad?: string; daten?: unknown };
  try {
    rumpf = await req.json();
  } catch {
    return NextResponse.json(
      { fehler: "Anfrage muss JSON sein: { pfad, daten }." },
      { status: 400 }
    );
  }

  const pfad = (rumpf.pfad ?? "").replace(/^\/+|\/+$/g, "");
  if (!ERLAUBTE_PFADE.test(pfad)) {
    return NextResponse.json(
      {
        fehler:
          "Dieser Bereich ist nicht freigeschaltet. Offen sind: serp, keywords_data, dataforseo_labs, on_page, backlinks, domain_analytics, content_analysis, business_data, ai_optimization, merchant, app_data, dataforseo_trends.",
      },
      { status: 400 }
    );
  }

  // Abholen-Endpunkte (task_get, tasks_ready) sind bei DataForSEO GET —
  // alles andere (task_post, live) ist POST.
  const istAbholen = /\/task_get\//.test(pfad) || pfad.endsWith("/tasks_ready");
  const antwort = await fetch(`https://api.dataforseo.com/v3/${pfad}`, {
    method: istAbholen ? "GET" : "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: istAbholen ? undefined : JSON.stringify(rumpf.daten ?? []),
  });

  const daten = (await antwort.json()) as { cost?: number };
  const kosten = typeof daten.cost === "number" ? daten.cost : 0;
  const neu = verbrauchBuchen(nutzer.id, kosten);

  return NextResponse.json(daten, {
    status: antwort.status,
    headers: {
      "x-mm-kosten-usd": kosten.toFixed(4),
      "x-mm-monat-usd": neu.kostenUsd.toFixed(4),
      "x-mm-limit-usd": String(LIMIT_USD[nutzer.tier]),
    },
  });
}
