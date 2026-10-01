"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { PLATTFORM_URL } from "@/lib/config";

type Postfach = { adresse: string; name: string };
type Antwort = { domains: { domain: string; postfaecher: Postfach[] }[] };

const BEISPIEL =
  "danke für die Anfrage, ich melde mich innerhalb von 24 Stunden, bei Notfällen direkt anrufen unter 0170 1234567";

/**
 * Baut den Versand-Prompt aus den echten Postfächern des Nutzers.
 * Anklicken statt abtippen — die Adressen holt die Seite aus der
 * Postfach-Zentrale.
 */
export function MailPrompt({ apiKey }: { apiKey?: string }) {
  const [postfaecher, setPostfaecher] = useState<Postfach[] | null>(null);
  const [absender, setAbsender] = useState("");
  const [empfaenger, setEmpfaenger] = useState("");
  const [andere, setAndere] = useState("");
  const [inhalt, setInhalt] = useState("");

  useEffect(() => {
    fetch("/api/mail")
      .then((r) => (r.ok ? r.json() : { domains: [] }))
      .then((d: Antwort) => {
        const alle = d.domains.flatMap((x) => x.postfaecher);
        setPostfaecher(alle);
        const ersteEcht = alle.find((p) => !p.adresse.startsWith("admin@"));
        if (ersteEcht) {
          setAbsender(ersteEcht.adresse);
          setEmpfaenger(ersteEcht.adresse);
        }
      })
      .catch(() => setPostfaecher([]));
  }, []);

  const zielAdresse = empfaenger === "andere" ? andere.trim() : empfaenger;

  const prompt = useMemo(() => {
    const von = absender || "{DEINE ABSENDER-ADRESSE}";
    const an = zielAdresse || "{WOHIN DEINE BENACHRICHTIGUNG SOLL}";
    const text = inhalt.trim() || `{${BEISPIEL}}`;
    const gleich = an === von;

    const gemeinsam = `Absender: ${von}
Meine Benachrichtigung geht an: ${an}${gleich ? " (dieselbe Adresse)" : ""}

In der Bestätigung an den Kunden soll grob stehen:
${text}

Die Mail an mich gestaltest du selbst. Hauptsache, ich sehe auf dem
Handy sofort, wer was will — und lande mit einem Tipp auf
"Antworten" direkt beim Kunden.

REGELN
- Leg die Zugangsdaten als Umgebungsvariablen an, lokal und bei
  Vercel. Ich bin im Terminal bei Vercel angemeldet — mach das
  selbst, ich will nichts im Dashboard klicken.
- Erst die Anfrage speichern, dann senden. Klemmt der Versand, steht
  der Lead trotzdem in meiner Admin-App — und ich sehe dort, dass die
  Mail nicht rausging.
- Der Kunde sieht seine Bestätigung auf der Seite sofort, auch wenn
  die Mail ein paar Sekunden braucht.
- Einfacher Text, keine Anhänge, keine Verfolgungspixel.

Zum Schluss: Testanfrage abschicken, beide Mails zeigen, Spam-Ordner
prüfen.`;

    return `Verschick zwei E-Mails, wenn jemand mein Anfrage-Formular
abschickt. Nutz dafür mein Postfach.

SO FUNKTIONIERT DAS (damit du nichts nachschlagen musst)
Mein Postfach liegt bei Migadu. Verschickt wird über:

  Postausgang (SMTP): smtp.migadu.com, Port 465, SSL
  Benutzername: die Absender-Adresse unten

Das Passwort hast du beim Anlegen selbst vergeben — nimm dieses,
erfinde keins. Falls du es nicht mehr hast, setz über meinen Zugang
unten ein neues und sag es mir.

MEIN ZUGANG ZU DEN POSTFÄCHERN
Adresse: ${PLATTFORM_URL}/api/mail
Anmeldung: Kopfzeile "Authorization: Bearer ${apiKey ?? "{DEIN-API-KEY}"}"

- GET zeigt meine Domains und Postfächer
- POST { "aktion": "postfach", "domain": "...", "adresse": "info",
         "name": "Firmenname", "passwort": "..." } legt ein Postfach an
- POST { "aktion": "passwort", "domain": "...", "adresse": "info",
         "neuesPasswort": "..." } setzt das Passwort eines vorhandenen
  Postfachs neu (Postfach bleibt erhalten)

${gemeinsam}`;
  }, [absender, zielAdresse, inhalt, apiKey]);

  const auswahl = (postfaecher ?? []).filter((p) => !p.adresse.startsWith("admin@"));

  return (
    <div className="rounded-3xl border border-brand-500/25 bg-brand-500/5 p-6">
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-white">
        <Mail className="size-5 text-brand-300" />
        Deinen Prompt zusammenklicken
      </h2>
      <p className="mb-5 text-xs leading-relaxed text-zinc-400">
        Adressen auswählen, in einem Satz sagen, was in der Bestätigung stehen
        soll — der fertige Prompt steht darunter.
      </p>

      {postfaecher !== null && auswahl.length === 0 ? (
        <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Du hast noch keine Postfächer. Mach zuerst die Lektion „Deine
          Firmen-E-Mail" — danach stehen deine Adressen hier zur Auswahl.
        </p>
      ) : null}

      <div className="mb-5 space-y-4">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
            Absender — von hier gehen die Mails raus
          </label>
          <select
            value={absender}
            onChange={(e) => setAbsender(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-surface-950/60 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500/50 focus:outline-none"
          >
            <option value="">— auswählen —</option>
            {auswahl.map((p) => (
              <option key={p.adresse} value={p.adresse}>
                {p.adresse}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
            Benachrichtigung an — wo du die Anfragen liest
          </label>
          <select
            value={empfaenger}
            onChange={(e) => setEmpfaenger(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-surface-950/60 px-3 py-2.5 text-sm text-zinc-200 focus:border-brand-500/50 focus:outline-none"
          >
            <option value="">— auswählen —</option>
            {auswahl.map((p) => (
              <option key={p.adresse} value={p.adresse}>
                {p.adresse}
              </option>
            ))}
            <option value="andere">Andere Adresse (z. B. privat) …</option>
          </select>
          {empfaenger === "andere" ? (
            <input
              value={andere}
              onChange={(e) => setAndere(e.target.value)}
              placeholder="chef@gmx.de"
              className="mt-2 w-full rounded-xl border border-white/10 bg-surface-950/60 px-3 py-2.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
            />
          ) : null}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
          Was soll in der Bestätigung grob stehen?
        </label>
        <textarea
          value={inhalt}
          onChange={(e) => setInhalt(e.target.value)}
          rows={3}
          placeholder={BEISPIEL}
          className="w-full resize-y rounded-xl border border-white/10 bg-surface-950/60 px-3 py-2.5 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-950/60">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 px-3 py-2">
          <span className="text-xs text-zinc-400">Dein fertiger Prompt</span>
          <CopyButton text={prompt} />
        </div>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed text-zinc-300">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
