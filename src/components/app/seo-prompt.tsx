"use client";

import { useMemo, useState } from "react";
import { Radar } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

/**
 * Der Audit-Prompt mit Einzugsgebiets-Regler: 10–100 km in Zehnerschritten,
 * danach Deutschland, D-A-CH, Europa. Der gewählte Wert steht sofort im
 * Prompt — samt der passenden location_codes für die Datenabfragen.
 */

type Stufe = { anzeige: string; promptText: string };

const KM_STUFEN = [10, 20, 30, 40, 50, 70, 100, 150, 200, 250];

const STUFEN: Stufe[] = [
  ...KM_STUFEN.map((km) => ({
    anzeige: `${km} km`,
    promptText: `${km} km um meinen Standort — Nachbarländer im Umkreis zählen mit`,
  })),
  {
    anzeige: "Deutschland",
    promptText: "ganz Deutschland (location_code 2276)",
  },
  {
    anzeige: "D-A-CH",
    promptText:
      "Deutschland, Österreich und die Schweiz — frag die Daten je Land ab (location_code 2276 Deutschland, 2040 Österreich, 2756 Schweiz)",
  },
  {
    anzeige: "Europa",
    promptText:
      "ganz Europa — frag die Daten Land für Land ab, die wichtigsten Märkte zuerst, und sag mir vorher, welche du prüfst",
  },
];

export function SeoPrompt({ prompt }: { prompt: string }) {
  const [stufe, setStufe] = useState(2); // Vorgabe: 30 km

  const fertig = useMemo(
    () => prompt.replaceAll("{EINZUGSGEBIET}", STUFEN[stufe].promptText),
    [prompt, stufe]
  );

  return (
    <div className="rounded-3xl border border-brand-500/25 bg-brand-500/5 p-6">
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-white">
        <Radar className="size-5 text-brand-300" />
        Der Audit-Prompt
      </h2>
      <p className="mb-5 text-xs leading-relaxed text-zinc-400">
        Einzugsgebiet einstellen — der Prompt passt sich an. Alles andere
        liest Claude aus deinem Projekt.
      </p>

      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between">
          <label className="text-xs uppercase tracking-widest text-zinc-500">
            Einzugsgebiet
          </label>
          <span className="rounded-lg bg-brand-500/15 px-2.5 py-0.5 text-sm font-semibold text-brand-300">
            {STUFEN[stufe].anzeige}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={STUFEN.length - 1}
          step={1}
          value={stufe}
          onChange={(e) => setStufe(Number(e.target.value))}
          className="w-full accent-[var(--color-brand-400,#a78bfa)]"
          aria-label="Einzugsgebiet"
        />
        <div className="mt-1 flex justify-between text-[0.65rem] text-zinc-600">
          <span>10</span>
          <span>50</span>
          <span>100</span>
          <span>250 km</span>
          <span>DE</span>
          <span>D-A-CH</span>
          <span>EU</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-950/60">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 px-3 py-2">
          <span className="text-xs text-zinc-400">Dein fertiger Prompt</span>
          <CopyButton text={fertig} />
        </div>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed text-zinc-300">
          {fertig}
        </pre>
      </div>
    </div>
  );
}
