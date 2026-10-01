import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { Role, Tier } from "@/lib/tiers";
import { findUserByEmail } from "@/lib/auth/users";

/**
 * Session als signiertes Cookie.
 *
 * Im Cookie steht nur die E-Mail-Adresse plus eine HMAC-Signatur. Alles
 * andere (Stufe, Rolle, Name) wird bei jedem Aufruf frisch aus dem
 * Nutzerspeicher geholt — ein manipuliertes Cookie kann sich damit weder
 * eine höhere Stufe noch die Adminrolle erschleichen.
 *
 * Der Schlüssel kommt aus AUTH_SECRET. Fehlt der, wird er aus dem
 * Blob-Token abgeleitet, damit die Anwendung nicht stillschweigend
 * ungesichert läuft.
 */

const SESSION_COOKIE = "mc_session";

export type Session = {
  userId: string;
  name: string;
  email: string;
  tier: Tier;
  role: Role;
  avatarColor: string;
  /** Onboarding schon durchlaufen? */
  onboarding: boolean;
};

function schluessel(): Buffer {
  const roh =
    process.env.AUTH_SECRET ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    "entwicklung-nur-lokal";
  return createHash("sha256").update("mc-session:" + roh).digest();
}

function signiere(nutzlast: string): string {
  return createHmac("sha256", schluessel()).update(nutzlast).digest("base64url");
}

function pruefeSignatur(nutzlast: string, signatur: string): boolean {
  const a = Buffer.from(signiere(nutzlast));
  const b = Buffer.from(signatur);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const roh = jar.get(SESSION_COOKIE)?.value;
  if (!roh) return null;

  const trenner = roh.lastIndexOf(".");
  if (trenner < 1) return null;
  const nutzlast = roh.slice(0, trenner);
  const signatur = roh.slice(trenner + 1);
  if (!pruefeSignatur(nutzlast, signatur)) return null;

  let email: string;
  try {
    email = String(
      (JSON.parse(Buffer.from(nutzlast, "base64url").toString("utf8")) as {
        email?: unknown;
      }).email ?? ""
    );
  } catch {
    return null;
  }
  if (!email) return null;

  // Einzige Wahrheitsquelle: der Nutzerspeicher. Gibt es den Account nicht
  // (mehr), ist die Session ungültig — egal was im Cookie steht.
  const user = await findUserByEmail(email);
  if (!user) return null;

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    tier: user.tier,
    role: user.role,
    avatarColor: user.avatarColor,
    onboarding: user.onboarding !== false,
  };
}

/** Wie lange die Anmeldung hält, wenn „Angemeldet bleiben" gesetzt ist. */
export const SESSION_TAGE = 30;

/**
 * Anmelde-Cookie.
 *
 * `angemeldetBleiben` entscheidet über die Lebensdauer: gesetzt hält die
 * Anmeldung 30 Tage, sonst endet sie mit dem Schließen des Browsers. Ohne
 * `maxAge` schreibt der Browser ein reines Sitzungs-Cookie, das nirgends
 * auf der Platte landet. Das ist die richtige Wahl an fremden Geräten.
 */
export function sessionCookie(email: string, angemeldetBleiben = true) {
  const nutzlast = Buffer.from(JSON.stringify({ email }), "utf8").toString(
    "base64url"
  );
  return {
    name: SESSION_COOKIE,
    value: `${nutzlast}.${signiere(nutzlast)}`,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(angemeldetBleiben ? { maxAge: 60 * 60 * 24 * SESSION_TAGE } : {}),
  };
}

export function clearedSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
