"use client";

import { useRef, useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";

/**
 * Kopiert Text in die Zwischenablage und quittiert kurz.
 *
 * Wenn der Browser die Zwischenablage sperrt (kein HTTPS, kein Fokus), wird
 * der zugehörige Textblock stattdessen **markiert** — dann reicht Strg/Cmd + C.
 * Der Block wird über die gemeinsame Umrandung gefunden, damit die Komponente
 * ohne IDs auskommt.
 */
export function CopyButton({
  text,
  label = "Kopieren",
}: {
  text: string;
  label?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<"idle" | "ok" | "select">("idle");

  function markieren() {
    const block = ref.current?.closest("div")?.parentElement?.querySelector("pre");
    if (!block) return;
    const range = document.createRange();
    range.selectNodeContents(block);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
    } catch {
      markieren();
      setState("select");
    }
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={copy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
        state === "ok"
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
          : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:text-white"
      }`}
      aria-label={`${label} — in die Zwischenablage`}
    >
      {state === "ok" ? (
        <>
          <Check className="size-3.5" /> Kopiert
        </>
      ) : state === "select" ? (
        <>
          <ClipboardCopy className="size-3.5" /> Markiert — Strg+C
        </>
      ) : (
        <>
          <ClipboardCopy className="size-3.5" /> {label}
        </>
      )}
    </button>
  );
}
