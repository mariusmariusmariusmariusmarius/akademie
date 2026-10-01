import { createHash, randomBytes } from "crypto";
import { ladeJson, loescheJson, speichereJson } from "@/lib/api/speicher";

/**
 * Token für „Passwort vergessen".
 *
 * Im Speicher liegt nur der Hash des Tokens, nie das Token selbst — wer
 * den Blob-Store lesen könnte, könnte damit trotzdem kein Passwort setzen.
 * Gültig 60 Minuten, danach greift die Prüfung nicht mehr.
 */

const GUELTIG_MS = 60 * 60 * 1000;

type Eintrag = { email: string; bis: number };

function pfad(token: string): string {
  return `reset/${createHash("sha256").update(token).digest("hex")}.json`;
}

export async function merkeToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await speichereJson(pfad(token), {
    email,
    bis: Date.now() + GUELTIG_MS,
  } satisfies Eintrag);
  return token;
}

export async function loeseToken(token: string): Promise<string | null> {
  if (!token) return null;
  const eintrag = await ladeJson<Eintrag>(pfad(token));
  if (!eintrag || eintrag.bis < Date.now()) return null;
  return eintrag.email;
}

export async function verbraucheToken(token: string): Promise<void> {
  await loescheJson(pfad(token));
}
