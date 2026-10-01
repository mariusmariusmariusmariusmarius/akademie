import type { Tier } from "@/lib/tiers";

/**
 * Verbrauchsbuch für die Bewertungs-API (in-memory).
 *
 * Jede weitergeleitete Anfrage kostet bei DataForSEO ein paar Zehntel-Cent —
 * die Antwort nennt den Betrag selbst im Feld `cost`. Hier wird er pro
 * Account und Monat aufsummiert. Wie der Userstore: lebt im RAM, wird später
 * durch die echte Datenbank ersetzt; die Signaturen bleiben gleich.
 */

export type Verbrauch = {
  /** Monat, für den gezählt wird, z. B. "2026-08" */
  monat: string;
  anfragen: number;
  /** Summe der DataForSEO-Kosten in USD (deren Abrechnungswährung) */
  kostenUsd: number;
  zuletzt: string | null;
};

/** Monatslimit in USD je Stufe — großzügig für den Kurs, schützt vor Amok */
export const LIMIT_USD: Record<Tier, number> = {
  // Free hat keinen Zugang zu den Werkzeugen, deshalb auch kein Budget.
  free: 0,
  starter: 5,
  pro: 20,
};

const store = globalThis as unknown as {
  __mcVerbrauch?: Map<string, Verbrauch>;
};
if (!store.__mcVerbrauch) {
  store.__mcVerbrauch = new Map();
}
const buch = store.__mcVerbrauch;

function aktuellerMonat(): string {
  return new Date().toISOString().slice(0, 7);
}

export function verbrauchVon(userId: string): Verbrauch {
  const monat = aktuellerMonat();
  const v = buch.get(userId);
  if (!v || v.monat !== monat) {
    const frisch: Verbrauch = { monat, anfragen: 0, kostenUsd: 0, zuletzt: null };
    buch.set(userId, frisch);
    return frisch;
  }
  return v;
}

export function verbrauchBuchen(userId: string, kostenUsd: number): Verbrauch {
  const v = verbrauchVon(userId);
  v.anfragen += 1;
  v.kostenUsd += kostenUsd;
  v.zuletzt = new Date().toISOString();
  return v;
}

export function verbrauchAlle(): Map<string, Verbrauch> {
  return buch;
}
