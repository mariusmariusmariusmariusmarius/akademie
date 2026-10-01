// Nimmt die Aufrufe entgegen, die <Zaehler /> meldet.
//
// Bewusst wortkarg: kein Cookie, keine rohe IP im Speicher — IP und
// Browserkennung gehen nur in den Tageshash (siehe lib/zaehlwerk.ts).
// Geantwortet wird immer mit 204, damit ein Aussetzer der Zählung nie als
// Fehler im Browser des Besuchers auftaucht.
import { aufrufMerken, zaehlwerkBereit } from "@/lib/zaehlwerk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|preview|monitor|curl|wget|python-requests|axios|node-fetch|facebookexternalhit|whatsapp|telegram/i;

const nichts = () => new Response(null, { status: 204 });

export async function POST(anfrage: Request) {
  if (!zaehlwerkBereit()) return nichts();

  const ua = anfrage.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return nichts();

  let koerper: { pfad?: string; verweiser?: string } = {};
  try {
    koerper = await anfrage.json();
  } catch {
    return nichts();
  }

  const pfad = String(koerper.pfad || "/").split("?")[0].slice(0, 200);
  if (pfad.startsWith("/api")) return nichts();

  const ip = (anfrage.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "0.0.0.0";

  try {
    await aufrufMerken({
      pfad,
      verweiser: String(koerper.verweiser || ""),
      ip,
      ua,
      host: anfrage.headers.get("host") || "",
    });
  } catch (e) {
    console.error("[zaehlen] fehlgeschlagen", e);
  }
  return nichts();
}
