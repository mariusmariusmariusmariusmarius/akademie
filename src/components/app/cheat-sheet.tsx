import { ClipboardCopy, KeyRound, Link2 } from "lucide-react";
import type { CheatSheet as CheatSheetData } from "@/lib/data/curriculum";
import { CopyButton } from "@/components/ui/copy-button";
import { OsIcon } from "@/components/ui/os-icon";

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof ClipboardCopy;
  children: React.ReactNode;
}) {
  return (
    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-300">
      <Icon className="size-3.5" /> {children}
    </p>
  );
}

/**
 * Die Box rechts neben dem Video: bewusst nur das Handwerkszeug —
 * Prompts zum Kopieren und die Links, wo es raufgeht. Erklärt wird im Video.
 */
export function CheatSheet({
  sheet,
  apiKey,
}: {
  sheet?: CheatSheetData;
  apiKey?: string;
}) {
  const prompts = sheet?.prompts ?? [];
  const links = sheet?.links ?? [];
  const hasContent = prompts.length > 0 || links.length > 0;

  return (
    <aside className="rounded-3xl border border-brand-500/25 bg-brand-500/5 p-6">
      <h2 className="mb-5 text-lg font-semibold text-white">Infos zur Lektion</h2>

      <div className="space-y-5">
        {apiKey ? (
          <div>
            <SectionLabel icon={KeyRound}>Deine API</SectionLabel>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface-950/60 px-3 py-2.5">
              <code className="min-w-0 truncate font-mono text-xs text-zinc-200">
                {apiKey}
              </code>
              <CopyButton text={apiKey} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Dein persönlicher Schlüssel — im Prompt unten schon eingesetzt.
              Behandle ihn wie ein Passwort.
            </p>
          </div>
        ) : null}

        {prompts.length > 0 ? (
          <div>
            <SectionLabel icon={ClipboardCopy}>Zum Kopieren</SectionLabel>
            <div className="space-y-4">
              {prompts.map((prompt, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-white/10 bg-surface-950/60"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-white/5 px-3 py-2">
                    <p className="flex items-center gap-2 text-xs leading-relaxed text-zinc-400">
                      {prompt.os ? (
                        <span className="text-zinc-300">
                          <OsIcon os={prompt.os} />
                        </span>
                      ) : null}
                      {prompt.label ?? "Prompt"}
                    </p>
                    <CopyButton text={prompt.text} />
                  </div>
                  {/* lange Prompts scrollen INNERHALB der Box, statt die Seite zu strecken */}
                  <pre className="max-h-56 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed text-zinc-300">
                    {prompt.text}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {links.length > 0 ? (
          <div>
            <SectionLabel icon={Link2}>Links</SectionLabel>
            <ul className="space-y-1.5 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-300 underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </a>
                  {link.note ? (
                    <span className="text-zinc-500"> — {link.note}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!hasContent ? (
          <p className="rounded-xl border border-dashed border-white/10 bg-surface-950/40 p-3 text-xs leading-relaxed text-zinc-500">
            {sheet?.emptyNote ??
              "Prompts und Links dieser Lektion — folgen mit dem Video."}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
