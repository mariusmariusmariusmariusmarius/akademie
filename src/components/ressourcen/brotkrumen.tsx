import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PLATTFORM_URL } from "@/lib/config";

export type Krume = {
  name: string;
  /** fehlt bei der aktuellen Seite — die letzte Krume ist nie ein Link */
  href?: string;
};

/**
 * Der Pfad über der Überschrift: Start › Ressourcen › diese Seite.
 *
 * Gibt zusätzlich eine BreadcrumbList nach schema.org aus. Google zeigt den
 * Pfad dann statt der nackten Adresse im Suchergebnis an — bei einer Seite,
 * die über Suche gefunden werden soll, ist das die halbe Miete.
 */
export function Brotkrumen({ krumen }: { krumen: Krume[] }) {
  const daten = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: krumen.map((krume, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: krume.name,
      ...(krume.href ? { item: `${PLATTFORM_URL}${krume.href}` } : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Pfad" className="mb-5">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500">
          {krumen.map((krume, i) => (
            <li key={krume.name} className="flex items-center gap-1.5">
              {i > 0 ? (
                <ChevronRight
                  className="size-3.5 shrink-0 text-zinc-700"
                  aria-hidden
                />
              ) : null}
              {krume.href ? (
                <Link
                  href={krume.href}
                  className="transition hover:text-brand-300"
                >
                  {krume.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-zinc-300">
                  {krume.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(daten) }}
      />
    </>
  );
}
