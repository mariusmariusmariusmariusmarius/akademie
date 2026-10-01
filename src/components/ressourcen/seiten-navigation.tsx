"use client";

import { useEffect, useState } from "react";

import { aktiverAbschnitt } from "@/lib/nav-position";

export type NavPunkt = {
  id: string;
  titel: string;
  /** Anzahl der Einträge, steht rechts neben dem Titel */
  anzahl?: number;
};

/**
 * Die Sprungleiste — links neben dem Inhalt, wie in einer Dokumentation.
 * Sie merkt sich, welcher Abschnitt gerade im Bild ist, und hebt ihn hervor.
 *
 * Bewusst über die Scroll-Position statt über einen IntersectionObserver:
 * der wird in Hintergrund-Tabs gedrosselt und meldet dann gar nichts mehr.
 * Außerdem findet diese Fassung auch Abschnitte, die erst nach dem Einhängen
 * in die Seite kommen — sie misst bei jedem Scrollen neu.
 *
 * Auf schmalen Bildschirmen ist links kein Platz: dort wird daraus eine
 * waagerechte Leiste, die oben mitläuft.
 */
export function SeitenNavigation({ punkte }: { punkte: NavPunkt[] }) {
  const [aktiv, setAktiv] = useState(punkte[0]?.id ?? "");
  const schluessel = punkte.map((p) => p.id).join(",");

  useEffect(() => {
    let angefordert = false;

    function messen() {
      angefordert = false;
      /* Bei jedem Scrollen neu messen — so werden auch Abschnitte gefunden,
         die erst nach dem Einhängen in die Seite kommen. */
      const abschnitte = punkte
        .map((punkt) => {
          const el = document.getElementById(punkt.id);
          return el
            ? { id: punkt.id, oben: el.getBoundingClientRect().top }
            : null;
        })
        .filter((a): a is { id: string; oben: number } => a !== null);
      setAktiv(aktiverAbschnitt(abschnitte, window.innerHeight * 0.3));
    }

    function anstossen() {
      if (angefordert) return;
      angefordert = true;
      requestAnimationFrame(messen);
    }

    messen();
    window.addEventListener("scroll", anstossen, { passive: true });
    window.addEventListener("resize", anstossen);
    return () => {
      window.removeEventListener("scroll", anstossen);
      window.removeEventListener("resize", anstossen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schluessel]);

  return (
    <>
      {/* breite Bildschirme: Leiste links, bleibt beim Scrollen stehen */}
      <nav aria-label="Auf dieser Seite" className="hidden lg:block">
        <div className="sticky top-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Auf dieser Seite
          </p>
          <ul className="border-l border-white/10">
            {punkte.map((punkt) => (
              <li key={punkt.id}>
                <a
                  href={`#${punkt.id}`}
                  aria-current={aktiv === punkt.id ? "true" : undefined}
                  className={`-ml-px flex items-baseline justify-between gap-3 border-l py-1.5 pl-4 text-sm transition ${
                    aktiv === punkt.id
                      ? "border-brand-400 font-medium text-white"
                      : "border-transparent text-zinc-500 hover:border-white/25 hover:text-zinc-300"
                  }`}
                >
                  <span>{punkt.titel}</span>
                  {punkt.anzahl ? (
                    <span className="font-mono text-xs text-zinc-600">
                      {punkt.anzahl}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* schmale Bildschirme: waagerecht, klebt oben fest */}
      <nav
        aria-label="Auf dieser Seite"
        className="sticky top-0 z-30 -mx-4 border-b border-white/8 bg-surface-950/85 px-4 py-2.5 backdrop-blur lg:hidden"
      >
        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {punkte.map((punkt) => (
            <li key={punkt.id}>
              <a
                href={`#${punkt.id}`}
                aria-current={aktiv === punkt.id ? "true" : undefined}
                className={`block whitespace-nowrap rounded-full border px-3 py-1 text-xs transition ${
                  aktiv === punkt.id
                    ? "border-brand-400/40 bg-brand-500/15 text-brand-200"
                    : "border-white/10 text-zinc-400"
                }`}
              >
                {punkt.titel}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
