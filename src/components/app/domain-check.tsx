"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";

type Ergebnis = {
  domain: string;
  status: "frei" | "vergeben" | "unbekannt";
  ablauf?: string | null;
  alternativen?: string[];
  fehler?: string;
};

/** Wunschdomain eintippen → frei oder vergeben, direkt in der Lektion. */
export function DomainCheck() {
  const [eingabe, setEingabe] = useState("");
  const [laedt, setLaedt] = useState(false);
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);

  async function pruefen(e: React.FormEvent) {
    e.preventDefault();
    if (!eingabe.trim() || laedt) return;
    setLaedt(true);
    setErgebnis(null);
    const r = await fetch(`/api/domain-check?domain=${encodeURIComponent(eingabe)}`);
    setErgebnis((await r.json()) as Ergebnis);
    setLaedt(false);
  }

  return (
    <div className="rounded-3xl border border-white/8 bg-surface-900/70 p-8">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
        <Search className="size-5 text-brand-300" />
        Ist deine Wunschdomain noch frei?
      </h2>
      <p className="mb-5 max-w-[60ch] text-sm leading-relaxed text-zinc-400">
        Direkt bei der offiziellen Vergabestelle nachgeschaut — kostenlos und
        ohne Anmeldung. Funktioniert mit .de, .com, .at und den meisten
        anderen Endungen.
      </p>

      <form onSubmit={pruefen} className="flex flex-wrap gap-3">
        <input
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          placeholder="meine-firma.de"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-surface-950/60 px-4 py-2.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={laedt}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
        >
          {laedt ? <Loader2 className="size-4 animate-spin" /> : null}
          {laedt ? "Prüfe …" : "Prüfen"}
        </button>
      </form>

      {ergebnis ? (
        ergebnis.fehler ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {ergebnis.fehler}
          </p>
        ) : ergebnis.status === "frei" ? (
          <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <strong className="font-semibold">{ergebnis.domain}</strong> ist frei —
            schnapp sie dir, bevor es ein anderer tut.
          </p>
        ) : ergebnis.status === "vergeben" ? (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <strong className="font-semibold">{ergebnis.domain}</strong> ist schon
            vergeben
            {ergebnis.ablauf ? ` (läuft am ${ergebnis.ablauf} aus)` : ""}.
          </p>
        ) : (
          <p className="mt-4 rounded-xl border border-white/10 bg-surface-950/40 px-4 py-3 text-sm text-zinc-400">
            Für diese Endung gibt die Vergabestelle keine Auskunft — prüf sie
            direkt bei deinem Registrar.
          </p>
        )
      ) : null}

      {ergebnis?.alternativen?.length ? (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
            {ergebnis.status === "frei" ? "Auch noch frei" : "Diese sind frei"}
          </p>
          <ul className="flex flex-wrap gap-2">
            {ergebnis.alternativen.map((a) => (
              <li key={a}>
                <button
                  type="button"
                  onClick={() => setEingabe(a)}
                  title="In das Suchfeld übernehmen"
                  className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/20"
                >
                  {a}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
