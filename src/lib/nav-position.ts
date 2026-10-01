/**
 * Welcher Abschnitt gilt als der aktuelle?
 *
 * Der unterste, dessen Anfang die Grenze schon passiert hat — das ist der,
 * den man gerade liest. Steht noch keiner über der Grenze (ganz oben auf der
 * Seite), gilt der erste.
 *
 * Bewusst als reine Rechnung ohne DOM: so lässt sie sich prüfen, ohne einen
 * Browser zu starten. Die Komponente misst nur die Abstände und fragt hier.
 */
export function aktiverAbschnitt(
  abschnitte: { id: string; oben: number }[],
  grenze: number,
): string {
  let treffer = abschnitte[0]?.id ?? "";
  for (const abschnitt of abschnitte) {
    if (abschnitt.oben <= grenze) treffer = abschnitt.id;
  }
  return treffer;
}
