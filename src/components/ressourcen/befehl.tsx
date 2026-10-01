import { CopyButton } from "@/components/ui/copy-button";
import { OsIcon } from "@/components/ui/os-icon";

/**
 * Ein Block zum Kopieren — Befehl oder Prompt. Die Beschriftung steht oben
 * und wird NICHT mitkopiert; im Text steht nur das, was ins Chatfenster soll.
 */
export function Befehl({
  os,
  label,
  text,
  hoch,
}: {
  os?: "mac" | "win";
  label: string;
  text: string;
  /** lange Prompts scrollen in der Box, statt die Seite zu strecken */
  hoch?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-surface-950/70">
      <div className="flex items-start justify-between gap-3 border-b border-white/5 px-3 py-2">
        <p className="flex items-center gap-2 text-xs leading-relaxed text-zinc-400">
          {os ? (
            <span className="shrink-0 text-zinc-300">
              <OsIcon os={os} />
            </span>
          ) : null}
          {label}
        </p>
        <CopyButton text={text} />
      </div>
      <pre
        className={`overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed text-zinc-300 ${
          hoch ? "max-h-80" : ""
        }`}
      >
        {text}
      </pre>
    </div>
  );
}
