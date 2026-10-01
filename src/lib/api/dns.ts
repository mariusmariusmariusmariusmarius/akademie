/**
 * DNS-Zentrale: Teilnehmer-Domains als Zonen im Cloudflare-Konto der
 * Plattform, plus je Domain ein Cloudflare-Token, das NUR diese eine Zone
 * bearbeiten darf (DNS Write, zone-scoped — Cloudflare erzwingt das).
 *
 * Der Teilnehmer gibt seine Domain ein und bekommt die zwei Nameserver
 * und sein Token zurück. Registriert bleibt die Domain, wo sie ist —
 * nur das Adressbuch zieht hierher um.
 *
 * Ablage in-memory wie der Userstore; die echten Daten (Zone, Token)
 * leben bei Cloudflare und überleben jeden Neustart. Die Zuordnung
 * Nutzer→Domain steht zusätzlich als TXT-Eintrag „_mm-eigentum" IN der
 * Zone selbst (Wert "mm:<userId>") — nach einem Kaltstart wird sie von
 * dort wieder aufgebaut. Nur der Token-WERT ist nicht wiederherstellbar
 * (Cloudflare zeigt ihn genau einmal); dafür gibt es tokenNeuErzeugen.
 */

import { ladeJson, speichereJson } from "./speicher";

const SPEICHER = (userId: string) => `dns/${userId}.json`;

export type DomainEintrag = {
  domain: string;
  zoneId: string;
  nameServers: string[];
  /** Cloudflare-Token, nur für diese Zone (DNS Write) */
  token: string;
  tokenId: string;
  angelegt: string;
};

const store = globalThis as unknown as {
  __mcDomains?: Map<string, DomainEintrag[]>;
};
if (!store.__mcDomains) {
  store.__mcDomains = new Map();
}
const domains = store.__mcDomains;

export const MAX_DOMAINS_PRO_KONTO = 3;

const API = "https://api.cloudflare.com/client/v4";

function kopf() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export function dnsKonfiguriert(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID
  );
}

export function domainsVon(userId: string): DomainEintrag[] {
  return domains.get(userId) ?? [];
}

/** Name des Eigentums-Markers in der Zone */
const EIGENTUM = "_mm-eigentum";

/**
 * Wie domainsVon, aber nach einem Kaltstart wird die Zuordnung aus den
 * _mm-eigentum-TXT-Einträgen der Zonen wieder aufgebaut. Token-Werte
 * lassen sich dabei nicht zurückholen (bleiben leer).
 */
export async function domainsVonSicher(userId: string): Promise<DomainEintrag[]> {
  // Dauerspeicher und Instanz-Speicher VEREINEN — mehrere Serverless-
  // Instanzen sehen sonst unterschiedliche Stände und überschreiben sich.
  const imSpeicher = domains.get(userId) ?? [];
  const abgelegt = (await ladeJson<DomainEintrag[]>(SPEICHER(userId))) ?? [];
  if (imSpeicher.length > 0 || abgelegt.length > 0) {
    const vereint = new Map<string, DomainEintrag>();
    for (const e of abgelegt) vereint.set(e.domain, e);
    for (const e of imSpeicher) {
      const alt = vereint.get(e.domain);
      // Eintrag mit Token-Wert gewinnt
      if (!alt || (e.token && !alt.token)) vereint.set(e.domain, e);
    }
    const liste = [...vereint.values()];
    domains.set(userId, liste);
    if (liste.length !== abgelegt.length || imSpeicher.length > 0) {
      await speichereJson(SPEICHER(userId), liste);
    }
    return liste;
  }
  if (!dnsKonfiguriert()) return [];

  // 2) Notnagel: Eigentums-Marker in den Zonen (Token-Werte nicht rekonstruierbar)
  const acct = process.env.CLOUDFLARE_ACCOUNT_ID;
  const gefunden: DomainEintrag[] = [];
  for (let seite = 1; seite <= 4; seite++) {
    const r = (await fetch(
      `${API}/zones?account.id=${acct}&per_page=50&page=${seite}`,
      { headers: kopf() }
    ).then((x) => x.json())) as CfAntwort<
      { id: string; name: string; name_servers: string[]; created_on?: string }[]
    >;
    if (!r.success || !r.result?.length) break;
    for (const zone of r.result) {
      const txt = (await fetch(
        `${API}/zones/${zone.id}/dns_records?type=TXT&name=${EIGENTUM}.${zone.name}`,
        { headers: kopf() }
      ).then((x) => x.json())) as CfAntwort<{ content: string }[]>;
      const wert = txt.result?.[0]?.content?.replace(/"/g, "") ?? "";
      if (wert === `mm:${userId}`) {
        gefunden.push({
          domain: zone.name,
          zoneId: zone.id,
          nameServers: zone.name_servers ?? [],
          token: "",
          tokenId: "",
          angelegt: (zone.created_on ?? "").slice(0, 10),
        });
      }
    }
    if (r.result.length < 50) break;
  }
  if (gefunden.length > 0) {
    domains.set(userId, gefunden);
    await speichereJson(SPEICHER(userId), gefunden);
  }
  return gefunden;
}

/** Eigentums-Marker in die Zone schreiben — bester Versuch, kein Abbruch */
async function eigentumSetzen(zoneId: string, domain: string, userId: string) {
  await fetch(`${API}/zones/${zoneId}/dns_records`, {
    method: "POST",
    headers: kopf(),
    body: JSON.stringify({
      type: "TXT",
      name: `${EIGENTUM}.${domain}`,
      content: `mm:${userId}`,
      ttl: 3600,
      comment: "Zuordnung zum Academy-Konto — nicht löschen",
    }),
  }).catch(() => undefined);
}

export function domainSchonVergeben(domain: string): boolean {
  for (const liste of domains.values()) {
    if (liste.some((d) => d.domain === domain)) return true;
  }
  return false;
}

type CfAntwort<T> = {
  success: boolean;
  errors?: { code: number; message: string }[];
  result: T;
};

/** Rechtegruppe "DNS Write" — einmal nachschlagen, dann gemerkt */
let dnsWriteGruppe: string | null = null;
async function holeDnsWriteGruppe(): Promise<string> {
  if (dnsWriteGruppe) return dnsWriteGruppe;
  const acct = process.env.CLOUDFLARE_ACCOUNT_ID;
  const r = (await fetch(`${API}/accounts/${acct}/tokens/permission_groups`, {
    headers: kopf(),
  }).then((x) => x.json())) as CfAntwort<{ id: string; name: string }[]>;
  const g = r.result?.find((x) => x.name === "DNS Write");
  if (!g) throw new Error("Rechtegruppe 'DNS Write' nicht gefunden.");
  dnsWriteGruppe = g.id;
  return g.id;
}

export async function zoneAnlegen(
  userId: string,
  domainRoh: string
): Promise<{ eintrag?: DomainEintrag; fehler?: string }> {
  const domain = domainRoh.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!/^[a-z0-9äöüß-]+(\.[a-z0-9-]+)+$/.test(domain)) {
    return { fehler: "Das sieht nicht wie eine Domain aus. Beispiel: meine-firma.de" };
  }
  const eigene = await domainsVonSicher(userId);
  if (eigene.some((d) => d.domain === domain)) {
    return { eintrag: eigene.find((d) => d.domain === domain) };
  }
  if (eigene.length >= MAX_DOMAINS_PRO_KONTO) {
    return { fehler: `Mehr als ${MAX_DOMAINS_PRO_KONTO} Domains pro Konto gehen nicht — meld dich bei uns.` };
  }
  if (domainSchonVergeben(domain)) {
    return { fehler: "Diese Domain ist auf der Plattform schon einem anderen Konto zugeordnet." };
  }

  const acct = process.env.CLOUDFLARE_ACCOUNT_ID;

  // 1) Zone anlegen
  const zone = (await fetch(`${API}/zones`, {
    method: "POST",
    headers: kopf(),
    body: JSON.stringify({ name: domain, account: { id: acct }, type: "full" }),
  }).then((x) => x.json())) as CfAntwort<{
    id: string;
    name_servers: string[];
  }>;
  if (!zone.success) {
    const m = zone.errors?.[0]?.message ?? "Unbekannter Fehler bei Cloudflare.";
    // 1061 = Zone existiert bereits (in irgendeinem Cloudflare-Konto)
    if (zone.errors?.[0]?.code === 1061) {
      return { fehler: "Diese Domain liegt schon bei Cloudflare (vielleicht ein altes Konto?). Meld dich bei uns, wir lösen das." };
    }
    return { fehler: `Cloudflare sagt: ${m}` };
  }

  // 2) Token nur für diese Zone prägen
  const gruppe = await holeDnsWriteGruppe();
  const token = (await fetch(`${API}/accounts/${acct}/tokens`, {
    method: "POST",
    headers: kopf(),
    body: JSON.stringify({
      name: `mm-dns ${domain}`,
      policies: [
        {
          effect: "allow",
          resources: { [`com.cloudflare.api.account.zone.${zone.result.id}`]: "*" },
          permission_groups: [{ id: gruppe }],
        },
      ],
    }),
  }).then((x) => x.json())) as CfAntwort<{ id: string; value: string }>;
  if (!token.success) {
    // Zone wieder wegräumen, sonst bleibt eine halbe Baustelle liegen
    await fetch(`${API}/zones/${zone.result.id}`, { method: "DELETE", headers: kopf() });
    return { fehler: `Token ließ sich nicht erzeugen: ${token.errors?.[0]?.message ?? "unbekannt"}` };
  }

  // 3) Eigentums-Marker in die Zone — damit die Zuordnung Neustarts überlebt
  await eigentumSetzen(zone.result.id, domain, userId);

  const eintrag: DomainEintrag = {
    domain,
    zoneId: zone.result.id,
    nameServers: zone.result.name_servers ?? [],
    token: token.result.value,
    tokenId: token.result.id,
    angelegt: new Date().toISOString().slice(0, 10),
  };
  domains.set(userId, [...eigene, eintrag]);
  await speichereJson(SPEICHER(userId), domains.get(userId));
  return { eintrag };
}

/**
 * Neues zonen-gebundenes Token prägen — für den Fall, dass der Token-Wert
 * nach einem Neustart nicht mehr im Speicher liegt. Das alte Token bleibt
 * gültig; wer es noch im Chat hat, kann es weiterbenutzen.
 */
export async function tokenNeuErzeugen(
  userId: string,
  domainRoh: string
): Promise<{ eintrag?: DomainEintrag; fehler?: string }> {
  const domain = domainRoh.trim().toLowerCase();
  const eigene = await domainsVonSicher(userId);
  const eintrag = eigene.find((d) => d.domain === domain);
  if (!eintrag) return { fehler: "Diese Domain gehört nicht zu deinem Konto." };

  const acct = process.env.CLOUDFLARE_ACCOUNT_ID;
  const gruppe = await holeDnsWriteGruppe();
  const token = (await fetch(`${API}/accounts/${acct}/tokens`, {
    method: "POST",
    headers: kopf(),
    body: JSON.stringify({
      name: `mm-dns ${domain}`,
      policies: [
        {
          effect: "allow",
          resources: { [`com.cloudflare.api.account.zone.${eintrag.zoneId}`]: "*" },
          permission_groups: [{ id: gruppe }],
        },
      ],
    }),
  }).then((x) => x.json())) as CfAntwort<{ id: string; value: string }>;
  if (!token.success) {
    return { fehler: `Token ließ sich nicht erzeugen: ${token.errors?.[0]?.message ?? "unbekannt"}` };
  }
  eintrag.token = token.result.value;
  eintrag.tokenId = token.result.id;
  domains.set(userId, eigene);
  await speichereJson(SPEICHER(userId), eigene);
  return { eintrag };
}

/** Zonen-Status live bei Cloudflare nachsehen (active = Nameserver umgestellt) */
export async function zonenStatus(zoneId: string): Promise<string> {
  const r = (await fetch(`${API}/zones/${zoneId}`, { headers: kopf() }).then((x) =>
    x.json()
  )) as CfAntwort<{ status: string }>;
  return r.success ? r.result.status : "unbekannt";
}

/** Not-Aus: Zone samt Token entfernen (nur eigene) */
export async function zoneEntfernen(
  userId: string,
  domain: string
): Promise<{ ok: boolean; fehler?: string }> {
  const eigene = await domainsVonSicher(userId);
  const eintrag = eigene.find((d) => d.domain === domain);
  if (!eintrag) return { ok: false, fehler: "Diese Domain gehört nicht zu deinem Konto." };
  const acct = process.env.CLOUDFLARE_ACCOUNT_ID;
  // Token(s) wegräumen — nach Kaltstart über den Namen wiederfinden
  const tokenIds: string[] = [];
  if (eintrag.tokenId) tokenIds.push(eintrag.tokenId);
  else {
    for (let seite = 1; seite <= 4; seite++) {
      const liste = (await fetch(`${API}/accounts/${acct}/tokens?per_page=50&page=${seite}`, {
        headers: kopf(),
      }).then((x) => x.json())) as CfAntwort<{ id: string; name: string }[]>;
      if (!liste.success || !liste.result?.length) break;
      tokenIds.push(...liste.result.filter((t) => t.name === `mm-dns ${domain}`).map((t) => t.id));
      if (liste.result.length < 50) break;
    }
  }
  for (const id of tokenIds) {
    await fetch(`${API}/accounts/${acct}/tokens/${id}`, {
      method: "DELETE",
      headers: kopf(),
    });
  }
  const r = (await fetch(`${API}/zones/${eintrag.zoneId}`, {
    method: "DELETE",
    headers: kopf(),
  }).then((x) => x.json())) as CfAntwort<unknown>;
  if (!r.success) return { ok: false, fehler: r.errors?.[0]?.message ?? "Löschen fehlgeschlagen." };
  domains.set(
    userId,
    eigene.filter((d) => d.domain !== domain)
  );
  await speichereJson(SPEICHER(userId), domains.get(userId));
  return { ok: true };
}
