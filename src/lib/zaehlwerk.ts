// Besucher zählen — dieselbe Zählweise wie auf der Hauptseite.
//
// Geschrieben wird in denselben Vercel-Blob-Speicher, den auch
// gefundenwerden.online benutzt, nur unter einem eigenen Präfix. Dadurch
// liest die Organisations-App alle drei Seiten aus einer Quelle, und die
// Zahlen bleiben trotzdem sauber getrennt.
//
//   ev/<tag>/…          Hauptseite (seit August 2026, unverändert)
//   ev-blog/<tag>/…     Blog
//   ev-academy/<tag>/…  Academy
//
// Der Zugang steht bewusst in einer eigenen Variablen `ZAEHL_BLOB_TOKEN`:
// Die Academy hat einen eigenen Blob-Speicher für andere Zwecke, und
// `BLOB_READ_WRITE_TOKEN` zu überschreiben würde den lahmlegen.
//
// Ein Aufruf ist ein Blob mit leerem Inhalt; alles Wissenswerte steht im
// Namen. So lässt sich die Auswertung allein aus `list()` bauen, ohne je
// einen Inhalt herunterzuladen.
//
//   <besucher>~<b64 pfad>~<b64 verweiser>~<zufall>
//
// Kein Cookie, keine rohe IP. Aus IP und Browserkennung wird je Tag ein
// Einwegwert gebildet — genug, um Besucher eines Tages zu zählen, zu wenig,
// um jemandem über Tage zu folgen.
import { put } from "@vercel/blob";
import crypto from "node:crypto";

/** Unter welchem Präfix diese Seite zählt. Muss je Projekt gesetzt sein. */
const PRAEFIX = process.env.ZAEHL_PRAEFIX || "ev-unbekannt";

/** Der Speicher, in dem alle drei Seiten zählen. */
const TOKEN = process.env.ZAEHL_BLOB_TOKEN || "";

export const zaehlwerkBereit = () => Boolean(TOKEN);

const enc = (s: string) => Buffer.from(s, "utf8").toString("base64url");

/** Kalendertag in Berliner Zeit, als JJJJ-MM-TT. */
function berlinTag(d: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(d);
}

/**
 * Tageskennung eines Besuchers.
 *
 * Der Tag steckt im Salz, also bekommt derselbe Mensch morgen eine andere
 * Kennung. Das Salz ist dasselbe wie auf der Hauptseite: So zählt jemand,
 * der vom Blog zur Hauptseite wechselt, an einem Tag als eine Person und
 * nicht als zwei.
 */
function besucherId(ip: string, ua: string, tag: string) {
  const salz = process.env.TRACK_SALT || "gefundenwerden-v1";
  return crypto.createHash("sha256").update(`${ip}|${ua}|${tag}|${salz}`).digest("hex").slice(0, 12);
}

/** Verweise von der eigenen Domain sind für die Auswertung „direkt". */
function verweisHost(verweiser: string, selbst: string) {
  if (!verweiser) return "";
  try {
    const h = new URL(verweiser).hostname.replace(/^www\./, "");
    return h && h !== selbst.replace(/^www\./, "") ? h : "";
  } catch {
    return "";
  }
}

export async function aufrufMerken(o: {
  pfad: string; verweiser: string; ip: string; ua: string; host: string;
}) {
  const tag = berlinTag();
  const name = [
    besucherId(o.ip, o.ua, tag),
    enc(o.pfad.slice(0, 200)),
    enc(verweisHost(o.verweiser, o.host).slice(0, 100)),
    crypto.randomBytes(4).toString("hex"),
  ].join("~");
  await put(`${PRAEFIX}/${tag}/${name}`, "1", {
    access: "private",
    addRandomSuffix: false,
    contentType: "text/plain",
    token: TOKEN,
  });
}
