"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Globe } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

type Eintrag = {
  domain: string;
  nameServers: string[];
  token: string;
  status: string;
};

const STATUS_TEXT: Record<string, string> = {
  active: "aktiv",
  pending: "wartet auf Nameserver",
};

/**
 * Nur-Lese-Übersicht der angeschlossenen Domains — für Einstellungen und
 * Dashboard. Angeschlossen wird in der Lektion; hier findet der Nutzer
 * Nameserver und Token jederzeit wieder.
 */
export function DomainUebersicht({ kompakt = false }: { kompakt?: boolean }) {
  const [eintraege, setEintraege] = useState<Eintrag[] | null>(null);
  const [laedt, setLaedt] = useState<string | null>(null);

  const tokenHolen = async (domain: string) => {
    setLaedt(domain);
    try {
      const r = await fetch("/api/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, tokenNeu: true }),
      });
      const d = await r.json();
      if (r.ok && d.token) {
        setEintraege((alt) =>
          (alt ?? []).map((e) => (e.domain === domain ? { ...e, token: d.token } : e))
        );
      }
    } finally {
      setLaedt(null);
    }
  };

  useEffect(() => {
    fetch("/api/dns")
      .then((r) => (r.ok ? r.json() : { domains: [] }))
      .then((d: { domains: Eintrag[] }) => setEintraege(d.domains))
      .catch(() => setEintraege([]));
  }, []);

  // Nichts anzuzeigen, solange noch keine Domain angeschlossen ist
  if (!eintraege || eintraege.length === 0) return null;

  const aktiv = eintraege.some((e) => e.status === "active");

  return (
    <section
      className={`relative overflow-hidden ${
        kompakt
          ? "rounded-3xl border border-white/8 bg-surface-900/70 p-6"
          : "rounded-3xl border border-white/8 bg-surface-900/70 p-7"
      }`}
    >
      {aktiv ? (
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gradient-to-br from-emerald-500/80 to-teal-400/80 opacity-25 [mask-image:radial-gradient(closest-side,black,transparent)]" />
      ) : null}
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
        <Globe className="size-5 text-brand-300" />
        Deine Domains
      </h2>
      <p className="mb-5 text-sm text-zinc-400">
        Nameserver und dein DNS-Token — jederzeit hier nachschlagbar. Behandle
        das Token wie ein Passwort.
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
                  e.status === "active"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {e.status === "active" ? <CheckCircle2 className="size-3.5" /> : null}
                {STATUS_TEXT[e.status] ?? e.status}
              </span>
            </div>

            <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
              Nameserver
            </p>
            <div className="mb-5 space-y-2.5">
              {e.nameServers.map((ns) => (
                <div
                  key={ns}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-950/60 px-4 py-3"
                >
                  <code className="min-w-0 truncate font-mono text-sm text-zinc-200">
                    {ns}
                  </code>
                  <CopyButton text={ns} />
                </div>
              ))}
            </div>

            <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
              DNS-Token
            </p>
            {e.token ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-950/60 px-4 py-3">
                <code className="min-w-0 truncate font-mono text-sm text-zinc-200">
                  {e.token}
                </code>
                <CopyButton text={e.token} />
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-950/60 px-4 py-3">
                <span className="text-xs text-zinc-500">
                  Dein Token hast du beim Anschließen bekommen — es gilt
                  weiter. Verlegt? Erzeug dir ein neues.
                </span>
                <button
                  type="button"
                  onClick={() => tokenHolen(e.domain)}
                  disabled={laedt === e.domain}
                  className="rounded-lg border border-brand-500/40 px-3 py-1.5 text-xs font-medium text-brand-300 transition hover:bg-brand-500/10 disabled:opacity-50"
                >
                  {laedt === e.domain ? "Wird erzeugt …" : "Neues Token erzeugen"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
