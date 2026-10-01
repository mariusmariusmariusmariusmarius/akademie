
/**
 * Mailversand der Plattform über Resend.
 *
 * Bewusst ohne SDK: ein fetch-Aufruf reicht, und so hängt der Registrierungs-
 * weg nicht an einem weiteren Paket. Schlägt der Versand fehl, bricht die
 * Registrierung NICHT ab — der Account ist wichtiger als die Mail. Der Fehler
 * wird geloggt und im Adminbereich sichtbar gemacht.
 */

const ABSENDER =
  process.env.MAIL_ABSENDER ?? "academy@gefundenwerden.online";
const ADMIN = process.env.MAIL_ADMIN ?? "";

export function plattformUrl(): string {
  return (
    process.env.NEXT_PUBLIC_PLATTFORM_URL ?? "https://academy.gefundenwerden.online"
  ).replace(/\/$/, "");
}

async function sende(opts: {
  an: string;
  betreff: string;
  html: string;
  antwortAn?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[mail] RESEND_API_KEY fehlt — nichts verschickt an", opts.an);
    return false;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `gefundenwerden.online Academy <${ABSENDER}>`,
        to: [opts.an],
        subject: opts.betreff,
        html: opts.html,
        ...(opts.antwortAn ? { reply_to: opts.antwortAn } : {}),
      }),
    });
    if (!r.ok) {
      console.error("[mail] Resend antwortete", r.status, await r.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[mail] Versand fehlgeschlagen:", e);
    return false;
  }
}

/** Gemeinsamer Rahmen, damit alle Mails gleich aussehen. */
function rahmen(inhalt: string): string {
  return `<!doctype html><html lang="de"><body style="margin:0;padding:0;background:#0b0b0f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0f;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#141419;border:1px solid #26262e;border-radius:16px;">
        <tr><td style="padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#d4d4d8;">
          ${inhalt}
        </td></tr>
      </table>
      <p style="max-width:560px;margin:20px auto 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b6b76;text-align:left;">
        gefundenwerden.online Academy · Marius Müller · Pont-a-Mousson Ring 89, 66869 Kusel<br>
        <a href="${plattformUrl()}/impressum" style="color:#6b6b76;">Impressum</a> ·
        <a href="${plattformUrl()}/datenschutz" style="color:#6b6b76;">Datenschutz</a>
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function knopf(href: string, text: string): string {
  return `<a href="${href}" style="display:inline-block;background:#6d4aff;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:10px;">${text}</a>`;
}

export async function sendeWillkommensmail(user: {
  name: string;
  email: string;
}): Promise<boolean> {
  const url = plattformUrl();
  return sende({
    an: user.email,
    betreff: "Willkommen in der Academy, hier geht's los",
    antwortAn: ADMIN || undefined,
    html: rahmen(`
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#ffffff;">Moin ${escape(user.name)},</h1>
      <p style="margin:0 0 16px;">dein Zugang steht. Du bist mit <strong style="color:#ffffff;">${escape(user.email)}</strong> registriert und kannst dich ab sofort einloggen.</p>
      <p style="margin:0 0 8px;">Im Kurs baust du in fünf Modulen:</p>
      <ul style="margin:0 0 24px;padding-left:20px;">
        <li style="margin-bottom:6px;">deine eigene Domain samt E-Mail-Postfach</li>
        <li style="margin-bottom:6px;">deine erste Website mit Claude</li>
        <li>ein Anfrage-Formular, das wirklich Mails verschickt</li>
      </ul>
      <p style="margin:0 0 28px;">${knopf(`${url}/login`, "Zur Academy")}</p>
      <p style="margin:0 0 16px;color:#a1a1aa;">Sieh dir in Ruhe die Kursübersicht an. Du brauchst nichts vorzubereiten und nichts zu installieren.</p>
      <p style="margin:0;color:#a1a1aa;">Wenn irgendwas hakt, antworte einfach auf diese Mail.<br>Marius</p>
    `),
  });
}

export async function sendePasswortMail(
  email: string,
  token: string
): Promise<boolean> {
  const link = `${plattformUrl()}/passwort-neu?token=${encodeURIComponent(token)}`;
  return sende({
    an: email,
    betreff: "Neues Passwort für deinen Academy-Zugang",
    html: rahmen(`
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#ffffff;">Passwort zurücksetzen</h1>
      <p style="margin:0 0 24px;">Du hast ein neues Passwort angefordert. Über diesen Link kannst du es setzen, er gilt <strong style="color:#ffffff;">60 Minuten</strong>:</p>
      <p style="margin:0 0 28px;">${knopf(link, "Neues Passwort setzen")}</p>
      <p style="margin:0;color:#a1a1aa;">Warst du das nicht, kannst du diese Mail ignorieren. Ohne den Link ändert sich nichts an deinem Zugang.</p>
    `),
  });
}

/** Meldung an Marius, damit keine Registrierung mehr stumm durchrutscht. */
export async function meldeRegistrierung(user: {
  name: string;
  email: string;
  mailZugestellt: boolean;
}): Promise<void> {
  if (!ADMIN) return;
  await sende({
    an: ADMIN,
    betreff: `Neue Registrierung: ${user.name}`,
    antwortAn: user.email,
    html: rahmen(`
      <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff;">Neue Registrierung</h1>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Name:</strong> ${escape(user.name)}</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">E-Mail:</strong> ${escape(user.email)}</p>
      <p style="margin:0 0 24px;"><strong style="color:#ffffff;">Willkommens-Mail:</strong> ${user.mailZugestellt ? "zugestellt" : "FEHLGESCHLAGEN, bitte prüfen"}</p>
      <p style="margin:0;">${knopf(`${plattformUrl()}/admin`, "Im Adminbereich ansehen")}</p>
    `),
  });
}

/** Bestätigung an den Kunden, sobald Stripe die Zahlung gemeldet hat. */
export async function sendeAboMail(user: {
  name: string;
  email: string;
  stufe: string;
}): Promise<boolean> {
  return sende({
    an: user.email,
    betreff: `Deine Stufe ${escape(user.stufe)} ist freigeschaltet`,
    html: rahmen(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Alles freigeschaltet</h1>
      <p style="margin:0 0 16px;">Hallo ${escape(user.name)},</p>
      <p style="margin:0 0 16px;">deine Zahlung ist durch. Dein Account steht ab sofort auf
      <strong style="color:#ffffff;">${escape(user.stufe)}</strong>, alle Module dieser Stufe sind offen.</p>
      <p style="margin:0 0 24px;">Rechnungen, Zahlungsmittel und Kündigung findest du jederzeit
      unter Einstellungen, Reiter Rechnung.</p>
      <p style="margin:0;">${knopf(`${plattformUrl()}/kurse`, "Weiter zu den Kursen")}</p>
    `),
  });
}

/** Meldung an Marius: Abo begonnen, gewechselt oder beendet. */
export async function meldeAbo(vorgang: {
  name: string;
  email: string;
  stufe: string;
  status: string;
}): Promise<void> {
  if (!ADMIN) return;
  await sende({
    an: ADMIN,
    betreff: `Abo ${escape(vorgang.status)}: ${escape(vorgang.name)} auf ${escape(vorgang.stufe)}`,
    antwortAn: vorgang.email,
    html: rahmen(`
      <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff;">Abo-Änderung</h1>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Name:</strong> ${escape(vorgang.name)}</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">E-Mail:</strong> ${escape(vorgang.email)}</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Neue Stufe:</strong> ${escape(vorgang.stufe)}</p>
      <p style="margin:0 0 24px;"><strong style="color:#ffffff;">Stripe-Status:</strong> ${escape(vorgang.status)}</p>
      <p style="margin:0;">${knopf(`${plattformUrl()}/admin`, "Im Adminbereich ansehen")}</p>
    `),
  });
}

/**
 * Eingangsbestätigung einer Kündigung. § 312k BGB verlangt sie sofort, in
 * Textform, mit Inhalt, Eingangszeitpunkt und dem Datum, zu dem der Vertrag
 * endet.
 */
export async function bestaetigeKuendigung(k: {
  name: string;
  email: string;
  vertrag: string;
  eingang: string;
  endetZum: string;
  art: string;
}): Promise<boolean> {
  return sende({
    an: k.email,
    betreff: "Deine Kündigung ist bei uns eingegangen",
    html: rahmen(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Kündigung bestätigt</h1>
      <p style="margin:0 0 16px;">Hallo ${escape(k.name)},</p>
      <p style="margin:0 0 16px;">wir bestätigen den Eingang deiner Kündigung.</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Vertrag:</strong> ${escape(k.vertrag)}</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Art der Kündigung:</strong> ${escape(k.art)}</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Eingegangen am:</strong> ${escape(k.eingang)}</p>
      <p style="margin:0 0 24px;"><strong style="color:#ffffff;">Vertrag endet zum:</strong> ${escape(k.endetZum)}</p>
      <p style="margin:0 0 24px;">Bis dahin bleibt dein Zugang offen. Danach fällt der
      Account auf die kostenlose Stufe zurück, dein Konto und deine Beiträge bleiben erhalten.</p>
      <p style="margin:0;">${knopf(`${plattformUrl()}/einstellungen?tab=rechnung`, "Zu deinen Einstellungen")}</p>
    `),
  });
}

/** Meldung an Marius, damit keine Kündigung unbemerkt bleibt. */
export async function meldeKuendigung(k: {
  name: string;
  email: string;
  vertrag: string;
  art: string;
  grund: string;
  automatisch: string;
}): Promise<void> {
  if (!ADMIN) return;
  await sende({
    an: ADMIN,
    betreff: `Kündigung: ${escape(k.name)}`,
    antwortAn: k.email,
    html: rahmen(`
      <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff;">Kündigung eingegangen</h1>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Name:</strong> ${escape(k.name)}</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">E-Mail:</strong> ${escape(k.email)}</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Vertrag:</strong> ${escape(k.vertrag)}</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Art:</strong> ${escape(k.art)}</p>
      <p style="margin:0 0 6px;"><strong style="color:#ffffff;">Grund:</strong> ${escape(k.grund || "keiner angegeben")}</p>
      <p style="margin:0 0 24px;"><strong style="color:#ffffff;">Bei Stripe:</strong> ${escape(k.automatisch)}</p>
      <p style="margin:0;">${knopf(`${plattformUrl()}/admin`, "Im Adminbereich ansehen")}</p>
    `),
  });
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
