"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Nur nach dieser Verweildauer gilt ein Aufruf als echter Besuch. */
const NACH_MS = 3000;

/**
 * Meldet einen Seitenaufruf, aber nur, wenn ein Mensch dahinter plausibel ist.
 *
 * Wortgleich mit dem Zähler der Hauptseite, damit die Zahlen der drei Seiten
 * vergleichbar sind — eine Seite, die großzügiger zählt als die andere, macht
 * jeden Vergleich wertlos.
 *
 * Der serverseitige Filter fängt nur Automaten, die sich in der
 * Browserkennung zu erkennen geben. Scanner mit getarnter Kennung, die
 * JavaScript ausführen, rutschten sonst durch: Sie holen die Seite einmal ab
 * und verschwinden wieder. Deshalb wird erst gezählt, wenn der Tab drei
 * Sekunden lang sichtbar war. Automaten warten nicht.
 *
 * Der Preis: Besucher, die sofort wieder abspringen, fehlen. Das ist der
 * Genauigkeit wert.
 *
 * Wichtig für Verkehr aus Anzeigen: Die Seite kann beim Einhängen noch
 * unsichtbar sein — die App-Browser von Instagram und Facebook schieben das
 * Fenster erst ein, iOS öffnet Links aus Nachrichten im Hintergrund. Deshalb
 * wird auf die Sichtbarkeit gewartet, statt sofort auszusteigen.
 */
export default function Zaehler() {
  const pfad = usePathname();
  const gemeldet = useRef<string | null>(null);

  useEffect(() => {
    if (!pfad || gemeldet.current === pfad) return;

    let uhr: number | undefined;
    let abgebrochen = false;

    const melde = () => {
      gemeldet.current = pfad;
      fetch("/api/zaehlen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pfad, verweiser: document.referrer || "" }),
        keepalive: true,
      }).catch(() => {});
    };

    // Die Uhr läuft nur, solange der Tab sichtbar ist. Wird er zwischendurch
    // weggelegt, fängt sie beim Zurückkommen von vorn an: Drei Sekunden
    // Aufmerksamkeit sollen drei echte Sekunden sein.
    const starte = () => {
      if (abgebrochen || uhr !== undefined) return;
      uhr = window.setTimeout(() => {
        uhr = undefined;
        if (!abgebrochen && document.visibilityState === "visible") melde();
      }, NACH_MS);
    };
    const stoppe = () => {
      if (uhr !== undefined) { window.clearTimeout(uhr); uhr = undefined; }
    };

    const beiWechsel = () => {
      if (abgebrochen || gemeldet.current === pfad) return;
      if (document.visibilityState === "visible") starte();
      else stoppe();
    };

    if (document.visibilityState === "visible") starte();
    document.addEventListener("visibilitychange", beiWechsel);

    return () => {
      abgebrochen = true;
      stoppe();
      document.removeEventListener("visibilitychange", beiWechsel);
    };
  }, [pfad]);

  return null;
}
