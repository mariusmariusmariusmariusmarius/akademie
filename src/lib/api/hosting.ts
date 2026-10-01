/**
 * Hosting-Zentrale: Teilnehmer-Websites als Kunden-Worker im
 * Workers-for-Platforms-Namespace des Plattform-Kontos.
 *
 * Eine Website = ein Worker mit statischen Dateien im Dispatch-Namespace.
 * Der Teilnehmer bekommt NIE ein Cloudflare-Token — er schickt seinen
 * mm_-Schlüssel, und die Plattform lädt in seinem Namen hoch.
 *
 * Der Upload läuft absichtlich ZWEISTUFIG, damit die Dateien nicht durch
 * diese Funktion müssen (Vercel begrenzt den Rumpf auf wenige Megabyte,
 * eine Website mit Fotos sprengt das):
 *
 *   1. "start"  — Claude schickt nur das Manifest (Pfad, Hash, Größe).
 *                 Zurück kommt ein kurzlebiges Upload-Token von Cloudflare,
 *                 das AUSSCHLIESSLICH die Dateien dieser einen Seite
 *                 annehmen darf, plus die Liste der fehlenden Hashes.
 *   2. "fertig" — Claude hat direkt zu Cloudflare hochgeladen und schickt
 *                 das Abschluss-Token; die Plattform setzt daraufhin das
 *                 Skript scharf.
 *
 * Erreichbar wird die Seite über den Router-Worker (mm-hosting-router),
 * der die Subdomain auf den Skriptnamen abbildet. Kunden-Worker im
 * Namespace sind absichtlich nicht direkt erreichbar.
 *
 * Die Datei-Hashes sind sha256(base64(Inhalt) + Endung), gekürzt auf 32
 * Zeichen. Wrangler nimmt dafür blake3 — Cloudflare akzeptiert aber jeden
 * eindeutigen 32-stelligen Hex-Wert, und sha256 steckt schon in Node.
 * Am 2026-09-03 gegen das echte Konto geprüft.
 */

import { domainsVonSicher } from "./dns";
import { ladeJson, speichereJson } from "./speicher";

const SPEICHER = (userId: string) => `hosting/${userId}.json`;

const API = "https://api.cloudflare.com/client/v4";

/** Der Namespace, in dem alle Teilnehmer-Seiten liegen. */
const NAMESPACE = process.env.CLOUDFLARE_DISPATCH_NAMESPACE ?? "mm-kundenseiten";

/** Der Router, der die Adresse auf den Kunden-Worker abbildet. */
const ROUTER = process.env.CLOUDFLARE_ROUTER_SKRIPT ?? "mm-hosting-router";

/** KV-Ablage des Routers: eigene Domain -> Skriptname. */
const ZUORDNUNG_KV =
  process.env.CLOUDFLARE_ZUORDNUNG_KV ?? "";

/**
 * Unter dieser Domain hängt der Router; <skript>.<domain> ist die Adresse.
 *
 * Bewusst eine EIGENE Domain, nicht gefundenwerden.online: Auf Subdomains
 * laufen fremde Inhalte, und Blocklisten wie Safe Browsing greifen im
 * Zweifel auf Domain-Ebene. Legt ein Teilnehmer Mist ab, soll das nicht die
 * Hauptseite mitreißen. Dasselbe Muster wie vercel.app neben vercel.com.
 */
export const SEITEN_DOMAIN =
  process.env.CLOUDFLARE_SEITEN_DOMAIN ?? "gefundenwerden.website";

export const MAX_SEITEN_PRO_KONTO = 3;

/** Cloudflare nimmt einzelne Dateien bis 25 MB. */
export const MAX_DATEI_BYTES = 25 * 1024 * 1024;

/** Und in Summe halten wir eine Seite unter 100 MB. */
export const MAX_SEITE_BYTES = 100 * 1024 * 1024;

export type SeitenEintrag = {
  /** Skriptname im Namespace, gleichzeitig die Subdomain */
  skript: string;
  /** wie der Teilnehmer sie genannt hat */
  name: string;
  adresse: string;
  dateien: number;
  bytes: number;
  angelegt: string;
  aktualisiert: string;
};

export type ManifestEintrag = { hash: string; size: number };
export type Manifest = Record<string, ManifestEintrag>;

const store = globalThis as unknown as { __mcSeiten?: Map<string, SeitenEintrag[]> };
if (!store.__mcSeiten) store.__mcSeiten = new Map();
const seiten = store.__mcSeiten;

function kopf() {
  return { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` };
}

export function hostingKonfiguriert(): boolean {
  return Boolean(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID);
}

/**
 * Aus dem Wunschnamen wird die Subdomain. Angehängt werden sechs Zeichen
 * aus der Nutzerkennung: So kann kein Teilnehmer den Namen eines anderen
 * besetzen oder dessen Seite überschreiben.
 */
export async function skriptName(userId: string, name: string): Promise<string> {
  const rein = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const kurz = await kennung(userId);
  return rein ? `${rein}-${kurz}` : `seite-${kurz}`;
}

async function kennung(userId: string): Promise<string> {
  const roh = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(userId));
  return [...new Uint8Array(roh)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 6);
}

/** Dauerspeicher und Instanz-Speicher vereinen — wie bei den Domains. */
export async function seitenVon(userId: string): Promise<SeitenEintrag[]> {
  const imSpeicher = seiten.get(userId) ?? [];
  const abgelegt = (await ladeJson<SeitenEintrag[]>(SPEICHER(userId))) ?? [];
  const vereint = new Map<string, SeitenEintrag>();
  for (const e of abgelegt) vereint.set(e.skript, e);
  for (const e of imSpeicher) vereint.set(e.skript, e);
  const liste = [...vereint.values()];
  seiten.set(userId, liste);
  return liste;
}

async function merken(userId: string, eintrag: SeitenEintrag) {
  const liste = (await seitenVon(userId)).filter((e) => e.skript !== eintrag.skript);
  liste.push(eintrag);
  seiten.set(userId, liste);
  await speichereJson(SPEICHER(userId), liste);
}

type CfAntwort<T> = { success: boolean; result?: T; errors?: { message: string }[] };

async function cf<T>(pfad: string, opt: RequestInit = {}): Promise<{ result?: T; fehler?: string }> {
  const antwort = await fetch(`${API}${pfad}`, {
    ...opt,
    headers: { ...kopf(), ...(opt.headers ?? {}) },
  });
  const daten = (await antwort.json().catch(() => ({}))) as CfAntwort<T>;
  if (!daten.success) {
    return { fehler: daten.errors?.map((e) => e.message).join("; ") || `Cloudflare antwortete ${antwort.status}.` };
  }
  return { result: daten.result };
}

/**
 * Zwischenspeicher der Seiten-Domain leeren. Gürtel zum Hosenträger.
 *
 * Der Hosenträger ist eine Cache-Regel IN der Zone gefundenwerden.website
 * ("Teilnehmer-Seiten nicht zwischenspeichern"), die den Zonen-Cache für
 * *.gefundenwerden.website abschaltet. Die ist der eigentliche Schutz —
 * wird sie entfernt, greift wieder das Verhalten von unten.
 *
 * Warum das nötig war, am 2026-09-03 gemessen: Ein Worker war gelöscht und
 * der Namespace leer, die Adresse antwortete trotzdem mit HTTP 200 und
 * "cf-cache-status: HIT" — über eine Viertelstunde lang, und kein Purge
 * hat daran etwas geändert (weder purge_everything noch nach Adresse noch
 * nach Hostname, alle meldeten Erfolg). "Abschalten" hätte also nicht
 * abgeschaltet. Mit der Cache-Regel ist eine gelöschte Seite nach rund
 * 10 Sekunden weg.
 *
 * Purge nach Hostname kann Cloudflare nur im Enterprise-Tarif, deshalb
 * hier die ganze Zone. Verschmerzbar, weil ohnehin nichts gecacht wird.
 */
async function cacheLeeren(): Promise<void> {
  const { result } = await cf<{ id: string }[]>(
    `/zones?name=${encodeURIComponent(SEITEN_DOMAIN)}`
  );
  const zoneId = result?.[0]?.id;
  if (!zoneId) return;
  await cf(`/zones/${zoneId}/purge_cache`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purge_everything: true }),
  });
}

/** Prüft das Manifest, bevor irgendetwas zu Cloudflare geht. */
function manifestPruefen(manifest: unknown): { manifest?: Manifest; fehler?: string } {
  if (!manifest || typeof manifest !== "object") {
    return { fehler: "Feld manifest fehlt — erwartet { \"/index.html\": { hash, size } }." };
  }
  const eintraege = Object.entries(manifest as Record<string, unknown>);
  if (eintraege.length === 0) return { fehler: "Das Manifest ist leer." };
  if (eintraege.length > 20000) return { fehler: "Mehr als 20.000 Dateien nimmt Cloudflare nicht." };

  let summe = 0;
  const geprueft: Manifest = {};
  for (const [pfad, wert] of eintraege) {
    if (!pfad.startsWith("/")) return { fehler: `Pfad "${pfad}" muss mit / beginnen.` };
    const e = wert as Partial<ManifestEintrag>;
    if (typeof e?.hash !== "string" || !/^[0-9a-f]{32}$/.test(e.hash)) {
      return { fehler: `Pfad "${pfad}": hash muss 32 Hex-Zeichen sein (sha256 des base64-Inhalts plus Endung, gekürzt).` };
    }
    if (typeof e?.size !== "number" || e.size < 0) {
      return { fehler: `Pfad "${pfad}": size fehlt oder ist keine Zahl.` };
    }
    if (e.size > MAX_DATEI_BYTES) {
      return { fehler: `Pfad "${pfad}" ist größer als 25 MB — Cloudflare nimmt keine größeren Einzeldateien.` };
    }
    summe += e.size;
    geprueft[pfad] = { hash: e.hash, size: e.size };
  }
  if (summe > MAX_SEITE_BYTES) {
    return { fehler: `Die Seite ist zusammen ${Math.round(summe / 1e6)} MB groß — das Limit liegt bei 100 MB.` };
  }
  if (!geprueft["/index.html"]) {
    return { fehler: "Es fehlt /index.html — ohne Startseite läuft die Website nicht." };
  }
  return { manifest: geprueft };
}

/**
 * Schritt 1: Upload-Sitzung eröffnen.
 *
 * Zurück kommt ein Token, mit dem Claude die Dateien DIREKT bei Cloudflare
 * ablädt, und die Liste der Hashes, die Cloudflare noch nicht kennt.
 */
export async function uploadStarten(
  userId: string,
  name: string,
  rohManifest: unknown
): Promise<{
  seite?: { skript: string; adresse: string; uploadUrl: string; jwt: string; buckets: string[][]; fehlt: number };
  fehler?: string;
}> {
  const { manifest, fehler } = manifestPruefen(rohManifest);
  if (fehler || !manifest) return { fehler };

  const skript = await skriptName(userId, name);
  const vorhanden = await seitenVon(userId);
  if (!vorhanden.some((s) => s.skript === skript) && vorhanden.length >= MAX_SEITEN_PRO_KONTO) {
    return {
      fehler: `Du hast schon ${MAX_SEITEN_PRO_KONTO} Seiten. Lösch eine (DELETE mit { name }), dann geht die nächste.`,
    };
  }

  const konto = process.env.CLOUDFLARE_ACCOUNT_ID;
  const { result, fehler: cfFehler } = await cf<{ jwt: string; buckets: string[][] }>(
    `/accounts/${konto}/workers/dispatch/namespaces/${NAMESPACE}/scripts/${skript}/assets-upload-session`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manifest }),
    }
  );
  if (cfFehler || !result) return { fehler: cfFehler ?? "Cloudflare gab keine Upload-Sitzung zurück." };

  const buckets = result.buckets ?? [];
  return {
    seite: {
      skript,
      adresse: `https://${skript}.${SEITEN_DOMAIN}`,
      uploadUrl: `${API}/accounts/${konto}/workers/assets/upload?base64=true`,
      jwt: result.jwt,
      buckets,
      fehlt: buckets.flat().length,
    },
  };
}

/**
 * Schritt 2: Skript scharf setzen.
 *
 * `abschluss` ist das Token aus der letzten Upload-Antwort von Cloudflare —
 * oder, wenn alle Dateien schon bekannt waren, das Token aus Schritt 1.
 */
export async function uploadAbschliessen(
  userId: string,
  name: string,
  abschluss: string,
  manifestFuerStatistik?: unknown
): Promise<{ seite?: SeitenEintrag; fehler?: string }> {
  if (!abschluss || typeof abschluss !== "string") {
    return { fehler: "Feld jwt fehlt — das Abschluss-Token aus der letzten Cloudflare-Upload-Antwort." };
  }
  const skript = await skriptName(userId, name);
  const konto = process.env.CLOUDFLARE_ACCOUNT_ID;

  const metadaten = {
    compatibility_date: "2026-09-01",
    assets: { jwt: abschluss, config: { html_handling: "auto-trailing-slash" } },
    bindings: [],
  };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadaten)], { type: "application/json" }), "metadata.json");

  const { fehler } = await cf<unknown>(
    `/accounts/${konto}/workers/dispatch/namespaces/${NAMESPACE}/scripts/${skript}`,
    { method: "PUT", body: form }
  );
  if (fehler) return { fehler };

  // Sonst liefert der Cache die vorige Fassung der Seite weiter.
  await cacheLeeren();

  const manifest = (manifestPruefen(manifestFuerStatistik).manifest ?? {}) as Manifest;
  const werte = Object.values(manifest);
  const vorher = (await seitenVon(userId)).find((s) => s.skript === skript);
  const jetzt = new Date().toISOString();
  const eintrag: SeitenEintrag = {
    skript,
    name,
    adresse: `https://${skript}.${SEITEN_DOMAIN}`,
    dateien: werte.length || vorher?.dateien || 0,
    bytes: werte.reduce((s, e) => s + e.size, 0) || vorher?.bytes || 0,
    angelegt: vorher?.angelegt ?? jetzt,
    aktualisiert: jetzt,
  };
  await merken(userId, eintrag);
  return { seite: eintrag };
}

/** Seite abschalten. Löscht den Kunden-Worker im Namespace. */
export async function seiteEntfernen(
  userId: string,
  name: string
): Promise<{ ok: boolean; fehler?: string }> {
  const skript = await skriptName(userId, name);
  const liste = await seitenVon(userId);
  if (!liste.some((s) => s.skript === skript)) {
    return { ok: false, fehler: `Zu "${name}" liegt in deinem Konto keine Seite.` };
  }
  const konto = process.env.CLOUDFLARE_ACCOUNT_ID;
  const { fehler } = await cf<unknown>(
    `/accounts/${konto}/workers/dispatch/namespaces/${NAMESPACE}/scripts/${skript}`,
    { method: "DELETE" }
  );
  if (fehler) return { ok: false, fehler };

  // Ohne das bleibt die abgeschaltete Seite aus dem Cache erreichbar.
  await cacheLeeren();

  const rest = liste.filter((s) => s.skript !== skript);
  seiten.set(userId, rest);
  await speichereJson(SPEICHER(userId), rest);
  return { ok: true };
}

/**
 * Eigene Domain auf eine gehostete Seite legen.
 *
 * Möglich ist das, weil beides im selben Konto liegt: die Zone (die hat
 * /api/dns angelegt) und die Website (die liegt im Namespace). Nötig sind
 * drei Dinge, und keins folgt aus dem anderen:
 *
 *   1. In der Zone zwei proxied Einträge, sonst kommt die Anfrage gar nicht
 *      erst bei Cloudflare an.
 *   2. Worker-Routen für die Domain, damit der Router sie überhaupt sieht.
 *   3. Ein KV-Eintrag, damit der Router weiß, WELCHE Seite gemeint ist —
 *      aus "moebel-mueller.de" lässt sich der Skriptname nicht ableiten.
 *
 * Angefasst werden nur A, AAAA und CNAME für die nackte Domain und www.
 * MX und alles rund um Mail bleibt unberührt.
 */
export async function domainVerbinden(
  userId: string,
  name: string,
  domain: string
): Promise<{
  adresse?: string;
  fehler?: string;
  eintraege?: DnsEintrag[];
  status?: string;
  hinweis?: string;
}> {
  const sauber = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(sauber)) {
    return { fehler: `"${domain}" sieht nicht wie eine Domain aus.` };
  }

  const skript = await skriptName(userId, name);
  const seite = (await seitenVon(userId)).find((s) => s.skript === skript);
  if (!seite) {
    return { fehler: `Zu "${name}" liegt in deinem Konto keine Seite. Erst hochladen, dann verbinden.` };
  }

  const eigene = await domainsVonSicher(userId);
  const zone = eigene.find((d) => d.domain.toLowerCase() === sauber);

  // Zwei Wege, je nachdem wo die Domain verwaltet wird. Liegt sie als Zone
  // im Plattform-Konto, machen wir alles selbst. Liegt sie beim bisherigen
  // Anbieter des Teilnehmers, melden wir sie als Custom Hostname an und
  // sagen ihm, welche Einträge er dort setzen muss.
  if (!zone) return fremdeDomainVerbinden(userId, skript, sauber);

  const konto = process.env.CLOUDFLARE_ACCOUNT_ID;

  // 1. DNS — bestehende A/AAAA/CNAME für Domain und www ersetzen
  for (const voll of [sauber, `www.${sauber}`]) {
    const { result: alt } = await cf<{ id: string; type: string }[]>(
      `/zones/${zone.zoneId}/dns_records?name=${encodeURIComponent(voll)}`
    );
    for (const eintrag of alt ?? []) {
      if (["A", "AAAA", "CNAME"].includes(eintrag.type)) {
        await cf(`/zones/${zone.zoneId}/dns_records/${eintrag.id}`, { method: "DELETE" });
      }
    }
    for (const [typ, wert] of [["A", "192.0.2.1"], ["AAAA", "100::"]]) {
      const { fehler } = await cf(`/zones/${zone.zoneId}/dns_records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typ,
          name: voll,
          content: wert,
          proxied: true,
          comment: `Website ${skript}, ausgeliefert von ${ROUTER}`,
        }),
      });
      if (fehler) return { fehler: `DNS-Eintrag ${typ} für ${voll} ging nicht: ${fehler}` };
    }
  }

  // 2. Worker-Routen
  for (const muster of [`${sauber}/*`, `www.${sauber}/*`]) {
    const { fehler } = await cf(`/zones/${zone.zoneId}/workers/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pattern: muster, script: ROUTER }),
    });
    // Eine schon bestehende Route ist kein Fehler, nur eine Wiederholung.
    if (fehler && !fehler.toLowerCase().includes("duplicate") && !fehler.includes("10020")) {
      return { fehler: `Route ${muster} ging nicht: ${fehler}` };
    }
  }

  // 3. Zuordnung für den Router
  const form = new FormData();
  form.append("value", skript);
  form.append("metadata", JSON.stringify({ userId }));
  const { fehler: kvFehler } = await cf(
    `/accounts/${konto}/storage/kv/namespaces/${ZUORDNUNG_KV}/values/${encodeURIComponent(sauber)}`,
    { method: "PUT", body: form }
  );
  if (kvFehler) return { fehler: `Zuordnung konnte nicht gespeichert werden: ${kvFehler}` };

  return { adresse: `https://${sauber}` };
}

export type DnsEintrag = { typ: string; name: string; wert: string; zweck: string };

/**
 * Domain anschließen, die NICHT im Plattform-Konto liegt.
 *
 * Der Teilnehmer behält seinen bisherigen Anbieter und seine Nameserver.
 * Cloudflare stellt trotzdem ein Zertifikat für seine Domain aus — das ist
 * "Cloudflare for SaaS", 100 Domains sind im Tarif enthalten.
 *
 * Vier Dinge sind dafür nötig, und keins folgt aus dem anderen:
 *   1. Custom Hostname anmelden — davon kommen die Nachweis-Einträge.
 *   2. Worker-Route auf GENAU diese Domain. Ohne sie antwortet Cloudflare
 *      mit 522: Zertifikat gültig, Verbindung angenommen, dahinter nichts.
 *      Die Wildcard-Route der Plattform greift hier nicht, weil die Anfrage
 *      unter der Kundendomain hereinkommt.
 *   3. Zuordnung im KV, damit der Router weiß, welche Seite gemeint ist.
 *   4. Der Teilnehmer setzt die zurückgegebenen Einträge bei seinem Anbieter.
 *
 * Am 2026-09-04 an einer Domain mit Nameservern bei All-Inkl durchgespielt.
 */
async function fremdeDomainVerbinden(
  userId: string,
  skript: string,
  domain: string
): Promise<{
  adresse?: string;
  fehler?: string;
  eintraege?: DnsEintrag[];
  status?: string;
  hinweis?: string;
}> {
  const konto = process.env.CLOUDFLARE_ACCOUNT_ID;

  // Gehört die Domain schon jemand anderem? Der Nachweis liefe zwar ohnehin
  // über die TXT-Einträge, aber so bleibt die Fehlermeldung verständlich.
  const belegt = await cf<{ userId?: string }>(
    `/accounts/${konto}/storage/kv/namespaces/${ZUORDNUNG_KV}/metadata/${encodeURIComponent(domain)}`
  );
  if (belegt.result?.userId && belegt.result.userId !== userId) {
    return { fehler: `"${domain}" ist bereits mit einem anderen Konto verbunden.` };
  }

  const { result: zonen } = await cf<{ id: string }[]>(
    `/zones?name=${encodeURIComponent(SEITEN_DOMAIN)}`
  );
  const zoneId = zonen?.[0]?.id;
  if (!zoneId) return { fehler: "Die Seiten-Domain ist auf dem Server nicht auffindbar." };

  // 1. Custom Hostname — vorhandenen wiederverwenden, sonst anlegen
  const { result: vorhanden } = await cf<CustomHostname[]>(
    `/zones/${zoneId}/custom_hostnames?hostname=${encodeURIComponent(domain)}`
  );
  let eintrag = vorhanden?.[0];
  if (!eintrag) {
    const angelegt = await cf<CustomHostname>(`/zones/${zoneId}/custom_hostnames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname: domain, ssl: { method: "txt", type: "dv" } }),
    });
    if (angelegt.fehler || !angelegt.result) {
      return { fehler: angelegt.fehler ?? "Cloudflare hat die Domain nicht angenommen." };
    }
    eintrag = angelegt.result;
  }

  // 2. Worker-Route — ohne die gibt es 522
  const route = await cf(`/zones/${zoneId}/workers/routes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pattern: `${domain}/*`, script: ROUTER }),
  });
  // Eine schon bestehende Route ist kein Fehler, sondern der Normalfall,
  // sobald jemand denselben Aufruf zum Stand-Abfragen wiederholt.
  if (route.fehler && !/already exists|duplicate|10020/i.test(route.fehler)) {
    return { fehler: `Route für ${domain} ging nicht: ${route.fehler}` };
  }

  // 3. Zuordnung für den Router
  const form = new FormData();
  form.append("value", skript);
  form.append("metadata", JSON.stringify({ userId }));
  const kv = await cf(
    `/accounts/${konto}/storage/kv/namespaces/${ZUORDNUNG_KV}/values/${encodeURIComponent(domain)}`,
    { method: "PUT", body: form }
  );
  if (kv.fehler) return { fehler: `Zuordnung konnte nicht gespeichert werden: ${kv.fehler}` };

  // 4. Was der Teilnehmer bei seinem Anbieter eintragen muss
  const eintraege: DnsEintrag[] = [
    {
      typ: "CNAME",
      name: domain,
      wert: `kunden.${SEITEN_DOMAIN}`,
      zweck: "leitet die Domain auf die Website",
    },
  ];
  const ov = eintrag.ownership_verification;
  if (ov?.name) {
    eintraege.push({
      typ: "TXT",
      name: ov.name,
      wert: ov.value,
      zweck: "weist nach, dass die Domain dir gehört",
    });
  }
  for (const v of eintrag.ssl?.validation_records ?? []) {
    if (!v.txt_name) continue;
    eintraege.push({
      typ: "TXT",
      name: v.txt_name,
      wert: v.txt_value,
      zweck: "gibt das HTTPS-Zertifikat frei",
    });
  }

  const fertig = eintrag.status === "active" && eintrag.ssl?.status === "active";
  return {
    adresse: `https://${domain}`,
    status: fertig ? "aktiv" : `${eintrag.status} / ${eintrag.ssl?.status ?? "?"}`,
    eintraege,
    hinweis: fertig
      ? "Die Domain ist verbunden und das Zertifikat steht."
      : "Trag diese Einträge bei deinem Domain-Anbieter ein. Danach dauert es " +
        "ein paar Minuten, bis Cloudflare sie sieht und das Zertifikat ausstellt. " +
        "Schick denselben Aufruf noch einmal, um den Stand zu prüfen. " +
        "Bei _acme-challenge sind es ZWEI Werte — beide eintragen, nicht einen ersetzen.",
  };
}

type CustomHostname = {
  id: string;
  status: string;
  ownership_verification?: { name?: string; value: string };
  ssl?: {
    status?: string;
    validation_records?: { txt_name?: string; txt_value: string }[];
  };
};
