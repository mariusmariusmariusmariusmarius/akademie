/**
 * Postfach-Zentrale: Migadu-Domains und -Postfächer für Teilnehmer.
 *
 * Migadu kennt keine Schlüssel je Domain — ihr API-Schlüssel gilt fürs ganze
 * Konto. Deshalb bekommt ihn kein Teilnehmer zu sehen: Er benutzt seinen
 * mm_-Schlüssel, und diese Schicht lässt nur Domains durch, die IHM gehören.
 *
 * Wem eine Domain gehört, steht im Beschreibungsfeld der Domain BEI MIGADU
 * ("mm:<userId>") — nicht im Arbeitsspeicher. Auf Vercel beantwortet sonst
 * mal die eine, mal die andere Instanz die Anfrage, und die Zuordnung wäre
 * beim nächsten Aufruf weg.
 */

export type MailDomain = {
  domain: string;
  angelegt: string;
  /** Migadu-Status: "active" = MX zeigt auf den Kurs-Mailserver */
  state?: string;
};

/** Markierung im Beschreibungsfeld der Migadu-Domain */
const marke = (userId: string) => `mm:${userId}`;

/**
 * Nutzereingaben, die in einen Migadu-Pfad wandern, müssen streng geprüft
 * werden: fetch löst "../" in URLs auf, ein Punkt-Segment im Postfachnamen
 * würde also auf eine FREMDE Domain zeigen. Deshalb hier Weißlisten statt
 * Maskierung — und zusätzlich encodeURIComponent beim Zusammenbauen.
 */
const DOMAIN_MUSTER = /^[a-z0-9äöüß-]+(\.[a-z0-9-]+)+$/;
const TEIL_MUSTER = /^[a-z0-9]([a-z0-9._+-]{0,62}[a-z0-9])?$/;

function pruefeDomain(domain: string): string | null {
  return DOMAIN_MUSTER.test(domain) ? domain : null;
}

function pruefeTeil(teil: string): string | null {
  const t = teil.trim().toLowerCase();
  return TEIL_MUSTER.test(t) ? t : null;
}

export const MAX_MAIL_DOMAINS = 3;
export const MAX_POSTFAECHER = 10;
/** Tageslimit je Postfach — schützt die Zustellbarkeit aller Teilnehmer */
export const TAGESLIMIT = 200;

const API = "https://api.migadu.com/v1";

export function mailKonfiguriert(): boolean {
  return Boolean(process.env.MIGADU_USER && process.env.MIGADU_KEY);
}

function kopf() {
  const auth = Buffer.from(
    `${process.env.MIGADU_USER}:${process.env.MIGADU_KEY}`
  ).toString("base64");
  return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

/** Alle Domains des Kontos bei Migadu holen */
async function alleDomains(): Promise<
  { name: string; description: string; state: string }[]
> {
  const r = await migadu("/domains");
  const liste = (r.daten.domains ?? []) as Record<string, unknown>[];
  return liste.map((d) => ({
    name: d.name as string,
    description: (d.description as string) ?? "",
    state: (d.state as string) ?? "",
  }));
}

export async function mailDomainsVon(userId: string): Promise<MailDomain[]> {
  const meine = (await alleDomains()).filter((d) => d.description === marke(userId));
  return meine.map((d) => ({ domain: d.name, angelegt: "", state: d.state }));
}

export async function gehoertNutzer(userId: string, domain: string): Promise<boolean> {
  if (!pruefeDomain(domain)) return false;
  const r = await migadu(`/domains/${encodeURIComponent(domain)}`);
  return r.ok && (r.daten.description as string) === marke(userId);
}

async function migadu(
  pfad: string,
  init?: { method?: string; body?: unknown }
): Promise<{ ok: boolean; daten: Record<string, unknown>; status: number }> {
  const r = await fetch(`${API}${pfad}`, {
    method: init?.method ?? "GET",
    headers: kopf(),
    body: init?.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  let daten: Record<string, unknown> = {};
  try {
    daten = (await r.json()) as Record<string, unknown>;
  } catch {
    // manche Antworten sind leer — Status genügt
  }
  return { ok: r.ok, daten, status: r.status };
}

/** Domain für Postfächer anlegen und dem Nutzer zuordnen */
export async function domainAnlegen(
  userId: string,
  domainRoh: string
): Promise<{ domain?: string; fehler?: string }> {
  const domain = domainRoh
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  if (!/^[a-z0-9äöüß-]+(\.[a-z0-9-]+)+$/.test(domain)) {
    return { fehler: "Das sieht nicht wie eine Domain aus. Beispiel: meine-firma.de" };
  }
  // Gibt es die Domain schon im Konto? Dann entscheidet die Markierung.
  const vorhanden = (await alleDomains()).find((d) => d.name === domain);
  if (vorhanden) {
    if (vorhanden.description === marke(userId)) return { domain };
    // Alles andere wird abgelehnt — auch Domains ohne Markierung. Wer eine
    // fremde oder unzugeordnete Domain einfach beanspruchen könnte, käme
    // sonst an deren Postfächer.
    return {
      fehler:
        "Diese Domain liegt schon im System und gehört nicht zu deinem Konto. Melde dich bei uns, wenn das ein Irrtum ist.",
    };
  }

  if ((await mailDomainsVon(userId)).length >= MAX_MAIL_DOMAINS) {
    return { fehler: `Mehr als ${MAX_MAIL_DOMAINS} Domains pro Konto gehen nicht — meld dich bei uns.` };
  }

  const r = await migadu("/domains", { method: "POST", body: { name: domain } });
  if (!r.ok) {
    return { fehler: `Migadu meldet: ${r.daten.error ?? r.status}` };
  }
  // Zuordnung dauerhaft bei Migadu hinterlegen
  await migadu(`/domains/${encodeURIComponent(domain)}`, {
    method: "PUT",
    body: { description: marke(userId) },
  });
  return { domain };
}

export async function postfaecherVon(domain: string) {
  if (!pruefeDomain(domain)) return [];
  const r = await migadu(`/domains/${encodeURIComponent(domain)}/mailboxes`);
  const liste = (r.daten.mailboxes ?? []) as Record<string, unknown>[];
  return liste.map((m) => ({
    adresse: m.address as string,
    name: m.name as string,
    tageslimit: m.daily_outgoing_limit as number,
  }));
}

export async function postfachAnlegen(
  domain: string,
  teil: string,
  name: string,
  passwort: string
): Promise<{ adresse?: string; fehler?: string }> {
  const d = pruefeDomain(domain);
  const t = pruefeTeil(teil);
  if (!d || !t) return { fehler: "Ungültige Adresse." };
  if ((await postfaecherVon(d)).length >= MAX_POSTFAECHER) {
    return { fehler: `Mehr als ${MAX_POSTFAECHER} Postfächer pro Domain gehen nicht.` };
  }
  const r = await migadu(`/domains/${encodeURIComponent(d)}/mailboxes`, {
    method: "POST",
    body: {
      local_part: t,
      name,
      password: passwort,
      daily_outgoing_limit: TAGESLIMIT,
    },
  });
  if (!r.ok) return { fehler: `Migadu meldet: ${r.daten.error ?? r.status}` };
  return { adresse: r.daten.address as string };
}

export async function postfachLoeschen(domain: string, teil: string) {
  const d = pruefeDomain(domain);
  const t = pruefeTeil(teil);
  if (!d || !t) return false;
  const r = await migadu(
    `/domains/${encodeURIComponent(d)}/mailboxes/${encodeURIComponent(t)}`,
    { method: "DELETE" }
  );
  return r.ok;
}

export async function aliasAnlegen(
  domain: string,
  teil: string,
  ziele: string[]
): Promise<{ adresse?: string; fehler?: string }> {
  const d = pruefeDomain(domain);
  const t = pruefeTeil(teil);
  if (!d || !t) return { fehler: "Ungültige Adresse." };
  // Ziele dürfen nur echte Adressen sein
  if (!ziele.every((z) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(z.trim()))) {
    return { fehler: "Ungültige Zieladresse." };
  }
  const r = await migadu(`/domains/${encodeURIComponent(d)}/aliases`, {
    method: "POST",
    body: { local_part: t, destinations: ziele.map((z) => z.trim()) },
  });
  if (!r.ok) return { fehler: `Migadu meldet: ${r.daten.error ?? r.status}` };
  return { adresse: r.daten.address as string };
}

/** Passwort (oder Name/Limit) eines bestehenden Postfachs ändern — PUT.
 *  POST würde bei vorhandener Adresse mit 400 antworten. */
export async function postfachAendern(
  domain: string,
  teil: string,
  aenderung: { passwort?: string; name?: string }
): Promise<{ adresse?: string; fehler?: string }> {
  const d = pruefeDomain(domain);
  const t = pruefeTeil(teil);
  if (!d || !t) return { fehler: "Ungültige Adresse." };
  if (aenderung.passwort && aenderung.passwort.length < 12) {
    return { fehler: "Das Passwort muss mindestens 12 Zeichen haben." };
  }
  const body: Record<string, unknown> = {};
  if (aenderung.passwort) body.password = aenderung.passwort;
  if (aenderung.name) body.name = aenderung.name;
  if (Object.keys(body).length === 0) return { fehler: "Nichts zu ändern." };
  const r = await migadu(
    `/domains/${encodeURIComponent(d)}/mailboxes/${encodeURIComponent(t)}`,
    { method: "PUT", body }
  );
  if (!r.ok) return { fehler: `Migadu meldet: ${r.daten.error ?? r.status}` };
  return { adresse: r.daten.address as string };
}

/** Die von Migadu geforderten DNS-Einträge holen — inkl. individuellem
 *  hosted-email-verify. So muss nichts geraten werden. */
export async function domainRecords(domain: string) {
  const d = pruefeDomain(domain);
  if (!d) return null;
  const r = await migadu(`/domains/${encodeURIComponent(d)}/records`);
  return r.ok ? r.daten : null;
}

/** Domain freischalten, wenn die DNS-Einträge stehen. */
export async function domainAktivieren(
  domain: string
): Promise<{ state?: string; fehler?: string }> {
  const d = pruefeDomain(domain);
  if (!d) return { fehler: "Ungültige Domain." };
  const r = await migadu(`/domains/${encodeURIComponent(d)}/activate`);
  if (!r.ok) {
    return { fehler: (r.daten.message as string) ?? (r.daten.error as string) ?? "Aktivierung fehlgeschlagen." };
  }
  return { state: r.daten.state as string };
}

