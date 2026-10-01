import { del, list, put } from "@vercel/blob";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

/**
 * Dauerhafter Kleinspeicher der Plattform (Vercel Blob, Store mm-kursdaten).
 *
 * Blob-Adressen sind öffentlich, aber unerratbar — sensible Inhalte werden
 * deshalb zusätzlich mit AES-256-GCM verschlüsselt. Der Schlüssel wird aus
 * dem Blob-Zugriffstoken abgeleitet: kein zweites Geheimnis nötig, und wer
 * das Token hat, hat ohnehin Vollzugriff auf den Store.
 *
 * ⚠️ Wichtig, teuer gelernt: Ein Blob unter derselben Adresse zu
 * überschreiben funktioniert NICHT verlässlich. Vercel liefert die alte
 * Fassung minutenlang aus dem CDN weiter — weder ein Query-String noch
 * `Cache-Control: no-cache` bustet den Cache, gemessen mit age 390 s auf
 * einem längst überschriebenen Eintrag. Deshalb bekommt jede Fassung eine
 * eigene, unveränderliche Adresse unter `<pfad>/<zeit>-<zufall>.json`, und
 * gelesen wird immer die neueste. Die Verzeichnisliste ist im Gegensatz zum
 * Inhalt sofort aktuell. Alte Fassungen werden nach dem Schreiben entfernt.
 */

function konfiguriert(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function schluessel(): Buffer {
  return createHash("sha256")
    .update("mm-kursdaten:" + process.env.BLOB_READ_WRITE_TOKEN)
    .digest();
}

function verschluesseln(klartext: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", schluessel(), iv);
  const daten = Buffer.concat([c.update(klartext, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), daten]).toString("base64");
}

function entschluesseln(blob: string): string {
  const roh = Buffer.from(blob, "base64");
  const d = createDecipheriv("aes-256-gcm", schluessel(), roh.subarray(0, 12));
  d.setAuthTag(roh.subarray(12, 28));
  return Buffer.concat([d.update(roh.subarray(28)), d.final()]).toString("utf8");
}

/** `daten/x.json` → `daten/x` — darunter liegen die einzelnen Fassungen. */
function ordner(pfad: string): string {
  return pfad.replace(/\.json$/, "");
}

async function holeInhalt<T>(url: string): Promise<T | null> {
  try {
    const text = await fetch(url).then((r) => r.text());
    return JSON.parse(entschluesseln(text)) as T;
  } catch {
    return null;
  }
}

export async function speichereJson(
  pfad: string,
  daten: unknown
): Promise<boolean> {
  if (!konfiguriert()) return false;
  const ordnerPfad = ordner(pfad);
  try {
    const neu = await put(
      `${ordnerPfad}/${Date.now()}-${randomBytes(4).toString("hex")}.json`,
      verschluesseln(JSON.stringify(daten)),
      {
        access: "public",
        contentType: "text/plain",
        addRandomSuffix: false,
        // Die Adresse ist einmalig, der Inhalt ändert sich nie — darf also
        // beliebig lange im Cache liegen.
        cacheControlMaxAge: 31_536_000,
      }
    );

    // Vorgänger wegräumen: alte Fassungen und der flache Eintrag aus der
    // Zeit, als noch überschrieben wurde.
    try {
      const alt = await list({ prefix: `${ordnerPfad}`, limit: 1000 });
      const weg = alt.blobs
        .filter((b) => b.url !== neu.url)
        .filter((b) => b.pathname === pfad || b.pathname.startsWith(`${ordnerPfad}/`))
        .map((b) => b.url);
      if (weg.length) await del(weg);
    } catch {
      // Aufräumen ist Kür — der neue Eintrag steht bereits.
    }
    return true;
  } catch {
    return false;
  }
}

/** Neueste Fassung eines Eintrags. */
export async function ladeJson<T>(pfad: string): Promise<T | null> {
  if (!konfiguriert()) return null;
  const ordnerPfad = ordner(pfad);
  try {
    const l = await list({ prefix: ordnerPfad, limit: 1000 });
    const fassungen = l.blobs
      .filter((b) => b.pathname.startsWith(`${ordnerPfad}/`))
      .sort((a, b) => b.pathname.localeCompare(a.pathname));

    if (fassungen.length) return holeInhalt<T>(fassungen[0].url);

    // Altbestand: flacher Eintrag von vor der Umstellung.
    const flach = l.blobs.find((b) => b.pathname === pfad);
    return flach ? holeInhalt<T>(`${flach.url}?t=${Date.now()}`) : null;
  } catch {
    return null;
  }
}

/**
 * Alle Einträge unter einem Präfix laden — je Eintrag nur die neueste
 * Fassung.
 */
export async function listeJson<T>(praefix: string): Promise<T[]> {
  if (!konfiguriert()) return [];
  try {
    const l = await list({ prefix: praefix, limit: 1000 });

    // Nach Eintrag gruppieren, je Gruppe die höchste (= jüngste) Fassung.
    // Ein flacher Eintrag aus der Zeit vor der Umstellung ist seine eigene
    // Gruppe — sonst würden alle alten Einträge zu einem verschmelzen.
    const gruppeVon = (pfad: string) => {
      const rest = pfad.slice(praefix.length);
      const schnitt = rest.lastIndexOf("/");
      return schnitt < 0 ? pfad : praefix + rest.slice(0, schnitt);
    };

    const neueste = new Map<string, string>();
    for (const b of l.blobs) {
      const gruppe = gruppeVon(b.pathname);
      const bisher = neueste.get(gruppe);
      if (!bisher || b.pathname > bisher) neueste.set(gruppe, b.pathname);
    }
    const urls = l.blobs
      .filter((b) => neueste.get(gruppeVon(b.pathname)) === b.pathname)
      .map((b) => b.url);

    const roh = await Promise.all(urls.map((u) => holeInhalt<T>(u)));
    return roh.filter((x): x is Awaited<T> => x !== null);
  } catch {
    return [];
  }
}

/** Einen Eintrag samt aller Fassungen endgültig entfernen. */
export async function loescheJson(pfad: string): Promise<boolean> {
  if (!konfiguriert()) return false;
  const ordnerPfad = ordner(pfad);
  try {
    const l = await list({ prefix: ordnerPfad, limit: 1000 });
    const weg = l.blobs
      .filter((b) => b.pathname === pfad || b.pathname.startsWith(`${ordnerPfad}/`))
      .map((b) => b.url);
    if (!weg.length) return false;
    await del(weg);
    return true;
  } catch {
    return false;
  }
}
