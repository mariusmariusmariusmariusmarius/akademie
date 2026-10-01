"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

const BEISPIEL =
  "danke für die Anfrage, ich melde mich innerhalb von 24 Stunden, bei Notfällen direkt anrufen unter 0170 1234567";

/**
 * Der Prompt für den Versand über Resend. Anders als beim eigenen Postfach
 * kennt die Plattform hier keine Adressen — deshalb Eingabefelder statt
 * Auswahl. Die Domain kommt vom Server, falls schon eine angeschlossen ist.
 */
export function ResendPrompt({ domain }: { domain?: string }) {
  const [absender, setAbsender] = useState("");
  const [empfaenger, setEmpfaenger] = useState("");
  const [inhalt, setInhalt] = useState("");

  const prompt = useMemo(() => {
    const von = absender.trim() || "{DEINE ABSENDER-ADRESSE, z. B. info@meine-firma.de}";
    const an = empfaenger.trim() || von;
    // Die Domain kommt aus der Absender-Adresse — wer z. B. über seine
    // All-Inkl-Adresse sendet, braucht genau DIE Domain bei Resend, nicht
    // die Kurs-Domain. Die dient nur als Vorbelegung, solange nichts dasteht.
    const dom = von.includes("@")
      ? von.split("@")[1]
      : (domain ?? "{DEINE-DOMAIN}");
    const text = inhalt.trim() || `{${BEISPIEL}}`;

    return `Bau den Mailversand für mein Anfrage-Formular über Resend.

Meine Domain: ${dom}
Mein Resend-Schlüssel: {HIER-EINSETZEN — beginnt mit re_}
Absender: ${von}
Meine Benachrichtigung geht an: ${an}${an === von ? " (dieselbe Adresse)" : ""}

SCHRITT 1 — Domain bestätigen
Damit ich von meiner eigenen Adresse senden darf, muss die Domain bei
Resend bestätigt sein. Leg sie dort an und hol dir die geforderten
DNS-Einträge. Das sind Versand-Nachweise (TXT für SPF und DKIM,
meist auch DMARC) plus ein MX-Eintrag auf einer UNTERDOMAIN wie
send.meine-domain.de — der ist nur für Rückläufer. Die MX-Einträge
meiner Hauptdomain, also meinen Posteingang und meine bestehenden
Postfächer, fasst du NICHT an — die bleiben, wo sie sind.

Dann setz die Einträge:
- Läuft meine DNS über die Kursplattform (ich habe ein DNS-Token aus
  der Domain-Lektion), setzt du sie direkt.
- Verwalte ich meine DNS selbst beim Anbieter, gibst du mir die
  Einträge als Tabelle und wartest, bis ich sie eingetragen habe.
Nimm genau die Werte, die Resend vorgibt, rate nichts. Prüf danach,
ob die Domain als bestätigt gilt.

SCHRITT 2 — Die zwei Mails
- An den Kunden: Bestätigung, dass die Anfrage angekommen ist. Inhalt
  grob: ${text}
  Dazu seine eigenen Angaben zum Nachlesen.
- An mich: Betreff mit Name und Anliegen, damit ich ihn auf dem Handy
  erfassen kann. Alle Angaben untereinander. Antworten-an auf die
  Adresse des Kunden, damit ich mit einem Tipp auf "Antworten" direkt
  bei ihm lande.
- Absender ist meine Adresse oben mit meinem Firmennamen.

REGELN
- Der Schlüssel kommt als Umgebungsvariable ins Projekt und zu Vercel.
  Ich bin im Terminal bei Vercel angemeldet — mach das selbst, ich
  will nichts im Dashboard klicken. Niemals in eine Datei meines
  Codes schreiben.
- Erst die Anfrage speichern, dann senden. Klemmt der Versand, steht
  der Lead trotzdem in meiner Admin-App.
- Geht eine Mail nicht raus, sag es mir — still verschlucken gilt
  nicht.
- Einfacher Text, keine Anhänge, keine Verfolgungspixel.

ZUM SCHLUSS
Testanfrage abschicken, beide Mails zeigen, Spam-Ordner prüfen.`;
  }, [absender, empfaenger, inhalt, domain]);

  const feld =
    "w-full rounded-xl border border-white/10 bg-surface-950/60 px-3 py-2.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none";

  return (
    <div className="rounded-3xl border border-white/8 bg-surface-900/70 p-6">
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-white">
        <Send className="size-5 text-zinc-400" />
        Dein Versand-Prompt für Resend
      </h2>
      <p className="mb-5 text-xs leading-relaxed text-zinc-400">
        Adressen eintragen, grob sagen, was in der Bestätigung stehen soll —
        der fertige Prompt steht darunter. Den Schlüssel holst du dir bei
        Resend, deine Postfächer bleiben unberührt.
      </p>

      <div className="mb-5 space-y-4">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
            Absender — von hier gehen die Mails raus
          </label>
          <input
            value={absender}
            onChange={(e) => setAbsender(e.target.value)}
            placeholder="info@meine-firma.de"
            className={feld}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
            Benachrichtigung an — wo du die Anfragen liest
          </label>
          <input
            value={empfaenger}
            onChange={(e) => setEmpfaenger(e.target.value)}
            placeholder="leer lassen = dieselbe Adresse"
            className={feld}
          />
        </div>

        <div>
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
