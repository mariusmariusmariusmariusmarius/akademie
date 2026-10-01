"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Mail } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

type Postfach = { adresse: string; name: string };
type Eintrag = { domain: string; state: string; postfaecher: Postfach[] };

/**
 * Postfach-Übersicht für die Einstellungen: Läuft die Domain schon über den
 * Kurs-Mailserver (grünes Häkchen), welche Adressen gibt es, und die
 * Serverdaten fürs Mail-Programm — jederzeit nachschlagbar.
 */
export function PostfachUebersicht({ apiAdresse }: { apiAdresse: string }) {
  const [eintraege, setEintraege] = useState<Eintrag[] | null>(null);

  useEffect(() => {
    fetch("/api/mail")
      .then((r) => (r.ok ? r.json() : { domains: [] }))
      .then((d: { domains: Eintrag[] }) => setEintraege(d.domains))
      .catch(() => setEintraege([]));
  }, []);

  if (!eintraege || eintraege.length === 0) return null;

  const aktiv = eintraege.some((e) => e.state === "active");

  const server = [
    { name: "Posteingang (IMAP)", wert: "imap.migadu.com", zusatz: "Port 993, SSL" },
    { name: "Postausgang (SMTP)", wert: "smtp.migadu.com", zusatz: "Port 465, SSL" },
    { name: "Postfach-API (für Claude)", wert: apiAdresse, zusatz: "Bearer = dein API-Schlüssel" },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-surface-900/70 p-7">
      {aktiv ? (
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gradient-to-br from-emerald-500/80 to-teal-400/80 opacity-25 [mask-image:radial-gradient(closest-side,black,transparent)]" />
      ) : null}
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
        <Mail className="size-5 text-brand-300" />
        Deine Postfächer
      </h2>
      <p className="mb-5 text-sm text-zinc-400">
        Dein Mailserver auf einen Blick: Status der Domain, alle Adressen und
        die Serverdaten fürs Mail-Programm. Lesen im Browser:{" "}
        <a
          href="https://webmail.gefundenwerden.online"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-brand-300 hover:underline"
        >
          webmail.gefundenwerden.online <ExternalLink className="size-3" />
        </a>
      </p>

      <ul className="space-y-5">
        {eintraege.map((e) => (
          <li
            key={e.domain}
            className="rounded-2xl border border-white/8 bg-surface-950/40 p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-base font-semibold text-white">
                {e.domain}
              </span>
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  e.state === "active"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {e.state === "active" ? (
                  <>
                    <CheckCircle2 className="size-3.5" /> zeigt auf den Kurs-Mailserver
                  </>
                ) : (
                  "wartet auf DNS-Einträge"
                )}
              </span>
            </div>

            <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
              Adressen
            </p>
            <div className="flex flex-wrap gap-2.5">
              {e.postfaecher.length ? (
                e.postfaecher.map((p) => (
                  <span
                    key={p.adresse}
                    className="rounded-xl border border-white/8 bg-surface-950/60 px-4 py-2.5 font-mono text-sm text-zinc-200"
                  >
                    {p.adresse}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">
                  Noch keine Postfächer angelegt.
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mb-2 mt-7 text-xs uppercase tracking-widest text-zinc-500">
        Serverdaten — Benutzername ist immer die volle Adresse
      </p>
      <div className="space-y-2.5">
        {server.map((z) => (
          <div
            key={z.name}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-950/60 px-4 py-3"
          >
            <span className="text-sm text-zinc-400">{z.name}</span>
            <span className="flex min-w-0 items-center gap-2">
              <code className="min-w-0 truncate font-mono text-sm text-zinc-200">
                {z.wert}
              </code>
              <span className="hidden text-xs text-zinc-500 sm:inline">
                {z.zusatz}
              </span>
              <CopyButton text={z.wert} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
