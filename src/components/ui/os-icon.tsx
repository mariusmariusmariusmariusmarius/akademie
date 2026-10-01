/**
 * Betriebssystem-Zeichen für die Prompt-Blöcke — damit auf einen Blick klar
 * ist, welche Zeile für welchen Rechner gilt. Bewusst als Inline-SVG:
 * lucide hat kein Apple- und kein Windows-Zeichen.
 */
export function OsIcon({ os }: { os: "mac" | "win" }) {
  if (os === "mac") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className="size-4 shrink-0"
      >
        <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.1-.8-1.6 0-3 .9-3.8 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.4-.9-2.3-3.6ZM14.3 5.3c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="size-4 shrink-0"
    >
      <path d="M3 5.6 10.2 4.6v7.1H3V5.6Zm8.6-1.2L21 3v8.7h-9.4V4.4ZM3 12.9h7.2V20L3 19v-6.1Zm8.6 0H21V21l-9.4-1.3v-6.8Z" />
    </svg>
  );
}
