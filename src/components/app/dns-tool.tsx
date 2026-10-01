"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

type Eintrag = {
  domain: string;
  nameServers: string[];
  token: string;
  status: string;
};

const STATUS_TEXT: Record<string, string> = {
  active: "aktiv — Nameserver sind umgestellt, es kann losgehen",
  pending: "wartet — trag die Nameserver bei deinem Registrar ein",
};

/**
 * Das Domain-Feld der Lektion „Domain verbinden": Domain rein, Zone wird
 * angelegt, Nameserver + persönliches DNS-Token kommen zurück.
 */
export function DnsTool() {
  const [domain, setDomain] = useState("");
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [eintraege, setEintraege] = useState<Eintrag[]>([]);

  async function laden() {
    const r = await fetch("/api/dns");
    if (r.ok) {
      const d = (await r.json()) as { domains: Eintrag[] };
      setEintraege(d.domains);
    }
  }
  useEffect(() => {
    void laden();
  }, []);

  async function anlegen(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim() || laedt) return;
    setLaedt(true);
    setFehler(null);
    const r = await fetch("/api/dns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    const d = (await r.json()) as { fehler?: string };
    if (!r.ok) {
      setFehler(d.fehler ?? "Das hat nicht geklappt — probier es gleich nochmal.");
    } else {
      setDomain("");
      await laden();
    }
    setLaedt(false);
  }

  return (
    <div className="rounded-3xl border border-white/8 bg-surface-900/70 p-8">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
        <Globe className="size-5 text-brand-300" />
        Deine Domain anschließen
      </h2>
      <p className="mb-5 max-w-[60ch] text-sm leading-relaxed text-zinc-400">
        Deine Domain bleibt, wo sie ist — hier zieht nur ihr Adressbuch (DNS)
        ein. Du bekommst zwei Nameserver und ein Token, mit dem Claude deine
        DNS-Einträge verwalten darf. Nur deine, keine anderen.
      </p>

      <form onSubmit={anlegen} className="flex flex-wrap gap-3">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="meine-firma.de"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-surface-950/60 px-4 py-2.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={laedt}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
        >
          {laedt ? <Loader2 className="size-4 animate-spin" /> : null}
          {laedt ? "Wird angelegt …" : "Anschließen"}
        </button>
      </form>

      {fehler ? (
        <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {fehler}
        </p>
      ) : null}

      {eintraege.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {eintraege.map((e) => (
            <li
              key={e.domain}
              className="rounded-2xl border border-white/8 bg-surface-950/40 p-5"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-white">
                  {e.domain}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    e.status === "active"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {STATUS_TEXT[e.status] ?? e.status}
                </span>
              </div>

              <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">
                Nameserver — beim Registrar eintragen
              </p>
              <div className="mb-3 space-y-1.5">
                {e.nameServers.map((ns) => (
                  <div
                    key={ns}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-950/60 px-3 py-2"
                  >
                    <code className="min-w-0 truncate font-mono text-xs text-zinc-200">
                      {ns}
                    </code>
                    <CopyButton text={ns} />
                  </div>
                ))}
              </div>

              <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">
                Dein DNS-Token — kommt in den Prompt rechts
              </p>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-950/60 px-3 py-2">
                <code className="min-w-0 truncate font-mono text-xs text-zinc-200">
                  {e.token}
                </code>
                <CopyButton text={e.token} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
