import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Passwort-Hashing mit scrypt (in Node eingebaut, kein Extra-Paket).
 *
 * Format: scrypt$N$r$p$salt$hash — die Parameter stehen im Hash, damit sie
 * später erhöht werden können, ohne Altbestände unbrauchbar zu machen.
 */

const N = 16384;
const R = 8;
const P = 1;
const LAENGE = 32;

export function hashPasswort(passwort: string): string {
  const salz = randomBytes(16);
  const key = scryptSync(passwort, salz, LAENGE, { N, r: R, p: P });
  return [
    "scrypt",
    N,
    R,
    P,
    salz.toString("base64"),
    key.toString("base64"),
  ].join("$");
}

/** Ist der gespeicherte Wert noch ein Klartext-Passwort aus der Demo-Zeit? */
export function istKlartext(gespeichert: string): boolean {
  return !gespeichert.startsWith("scrypt$");
}

export function pruefePasswort(passwort: string, gespeichert: string): boolean {
  if (istKlartext(gespeichert)) {
    // Altbestand: Klartext-Vergleich, danach ruft der Aufrufer hashPasswort auf.
    const a = Buffer.from(passwort);
    const b = Buffer.from(gespeichert);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  const [, n, r, p, salz, hash] = gespeichert.split("$");
  try {
    const erwartet = Buffer.from(hash, "base64");
    const berechnet = scryptSync(passwort, Buffer.from(salz, "base64"), erwartet.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return timingSafeEqual(erwartet, berechnet);
  } catch {
    return false;
  }
}
