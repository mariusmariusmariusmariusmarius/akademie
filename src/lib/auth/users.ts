import { createHash } from "crypto";
import type { Role, Tier } from "@/lib/tiers";
import { hashPasswort, istKlartext, pruefePasswort } from "@/lib/auth/passwort";
import { ladeJson, listeJson, speichereJson } from "@/lib/api/speicher";

/**
 * Nutzerspeicher der Plattform.
 *
 * Liegt im verschlüsselten Blob-Store (derselbe wie Domains und Hosting):
 * ein Eintrag pro Account unter `nutzer/<hash der E-Mail>.json`. Ein Eintrag
 * je Nutzer statt einer großen Liste — dadurch können sich zwei Leute
 * gleichzeitig registrieren, ohne sich gegenseitig zu überschreiben.
 *
 * Passwörter stehen als scrypt-Hash drin, auch bei den beiden fest
 * eingetragenen Accounts unten, damit kein Klartext im Quelltext steht.
 * Sollte doch einmal ein Klartext-Eintrag auftauchen (Altbestand), wird er
 * beim ersten erfolgreichen Login automatisch auf einen Hash umgestellt.
 */

export type User = {
  id: string;
  name: string;
  email: string;
  /** scrypt-Hash. Altbestände im Klartext werden beim Login migriert. */
  password: string;
  tier: Tier;
  role: Role;
  avatarColor: string;
  createdAt: string;
  /** Persönlicher Schlüssel für die Bewertungs-API (mm_…) */
  apiKey: string;
  /** Im Onboarding gewähltes Ziel — steuert die Empfehlung im Dashboard */
  ziel?: string;
  /** Onboarding durchlaufen? Sonst landet der Login auf /willkommen */
  onboarding?: boolean;
  /** Zeitpunkt, zu dem die Willkommens-Mail rausging (leer = nicht verschickt) */
  willkommensmail?: string;
  /** Stripe-Kundennummer (cus_…), sobald einmal gebucht wurde */
  stripeKunde?: string;
  /** Laufendes Abo bei Stripe. Die Stufe selbst steht in `tier`. */
  abo?: {
    id: string;
    /** Stripe-Status: active, trialing, past_due, canceled … */
    status: string;
    /** Läuft zum Ende der Periode aus (gekündigt, aber noch bezahlt) */
    endetAm?: string;
  };
};

const seedUsers: User[] = [
  {
    id: "u_marius",
    name: "Marius",
    email: "admin@example.com",
    password: process.env.SEED_PASSWORT_HASH ?? "",
    tier: "pro",
    role: "admin",
    avatarColor: "from-emerald-500 to-teal-400",
    createdAt: "2025-12-01",
    apiKey: process.env.SEED_API_KEY ?? "",
    onboarding: true,
  },
  {
    id: "u_demo",
    name: "Demo-Konto",
    email: "demo@example.com",
    password: process.env.SEED_PASSWORT_HASH ?? "",
    tier: "free",
    role: "member",
    avatarColor: "from-blue-500 to-indigo-500",
    createdAt: "2026-09-07",
    apiKey: process.env.SEED_API_KEY ?? "",
    onboarding: true,
  },
];

/** mm_ + 40 Hex-Zeichen — pro Account einmalig, zeigt nie Systeminternas */
export function neuerApiKey(): string {
  const b = new Uint8Array(20);
  crypto.getRandomValues(b);
  return "mm_" + [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function normalisiereEmail(email: string): string {
  return email.trim().toLowerCase();
}

function pfad(email: string): string {
  const h = createHash("sha256").update(normalisiereEmail(email)).digest("hex");
  return `nutzer/${h}.json`;
}

/**
 * Kurzlebiger Zwischenspeicher, damit nicht jeder Seitenaufruf eine
 * Blob-Anfrage auslöst. 15 Sekunden — lang genug, um Rendern billig zu
 * machen, kurz genug, dass eine Stufenänderung sofort spürbar ist.
 */
const CACHE_MS = 15_000;
const cacheStore = globalThis as unknown as {
  __mcCache?: Map<string, { user: User | null; bis: number }>;
};
cacheStore.__mcCache ??= new Map();
const cache = cacheStore.__mcCache;

function ausCache(email: string): User | null | undefined {
  const t = cache.get(email);
  if (!t) return undefined;
  if (t.bis < Date.now()) {
    cache.delete(email);
    return undefined;
  }
  return t.user;
}

function inCache(email: string, user: User | null) {
  cache.set(email, { user, bis: Date.now() + CACHE_MS });
}

function seed(email: string): User | undefined {
  return seedUsers.find((u) => u.email === email);
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const key = normalisiereEmail(email);
  if (!key) return undefined;

  const zwischen = ausCache(key);
  if (zwischen !== undefined) return zwischen ?? undefined;

  const abgelegt = await ladeJson<User>(pfad(key));
  const user = abgelegt ?? seed(key);
  inCache(key, user ?? null);
  return user;
}

async function speichere(user: User): Promise<void> {
  await speichereJson(pfad(user.email), user);
  inCache(user.email, user);
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | undefined> {
  const user = await findUserByEmail(email);
  if (!user || !pruefePasswort(password, user.password)) return undefined;

  // Altbestand aus der Demo-Zeit beim ersten richtigen Login nachhärten.
  if (istKlartext(user.password)) {
    user.password = hashPasswort(password);
    await speichere(user);
  }
  return user;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user?: User; error?: string }> {
  const email = normalisiereEmail(input.email);
  if (await findUserByEmail(email)) {
    return { error: "Diese E-Mail-Adresse ist bereits registriert." };
  }
  const user: User = {
    id: `u_${crypto.randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    email,
    password: hashPasswort(input.password),
    tier: "free",
    role: "member",
    avatarColor: "from-brand-500 to-accent-500",
    createdAt: new Date().toISOString().slice(0, 10),
    apiKey: neuerApiKey(),
    onboarding: false,
  };
  await speichere(user);
  await speichereJson(schluesselPfad(user.apiKey), { email: user.email });
  return { user };
}

/**
 * Zeiger vom API-Schlüssel auf die E-Mail-Adresse. Ohne den müsste jede
 * API-Anfrage alle Nutzer laden — mit ihm ist es ein einzelner Zugriff.
 */
function schluesselPfad(apiKey: string): string {
  const h = createHash("sha256").update(apiKey).digest("hex");
  return `apikey/${h}.json`;
}

export async function findUserByApiKey(apiKey: string): Promise<User | undefined> {
  const key = apiKey.trim();
  if (!key.startsWith("mm_")) return undefined;

  const zeiger = await ladeJson<{ email: string }>(schluesselPfad(key));
  if (zeiger?.email) {
    const user = await findUserByEmail(zeiger.email);
    // Zeiger könnte veraltet sein, wenn der Schlüssel neu vergeben wurde.
    if (user?.apiKey === key) return user;
  }

  // Demo-Accounts haben keinen Zeiger im Speicher.
  return seedUsers.find((u) => u.apiKey === key);
}

/**
 * Zeiger von der Stripe-Kundennummer auf die E-Mail. Stripe-Ereignisse
 * nennen nur `cus_…`; ohne diesen Zeiger müsste der Webhook alle Nutzer
 * laden, um den Account zu finden.
 */
function kundenPfad(stripeKunde: string): string {
  return `stripekunde/${stripeKunde}.json`;
}

export async function merkeStripeKunde(
  stripeKunde: string,
  email: string
): Promise<void> {
  await speichereJson(kundenPfad(stripeKunde), { email: normalisiereEmail(email) });
}

export async function findUserByStripeKunde(
  stripeKunde: string
): Promise<User | undefined> {
  const zeiger = await ladeJson<{ email: string }>(kundenPfad(stripeKunde));
  if (zeiger?.email) {
    const user = await findUserByEmail(zeiger.email);
    if (user) return user;
  }
  return (await listUsers()).find((u) => u.stripeKunde === stripeKunde);
}

export async function listUsers(): Promise<User[]> {
  const abgelegt = await listeJson<User>("nutzer/");
  const bekannt = new Set(abgelegt.map((u) => normalisiereEmail(u.email)));
  const rest = seedUsers.filter((u) => !bekannt.has(u.email));
  return [...abgelegt, ...rest].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

/** Einzelne Felder eines Accounts ändern und dauerhaft ablegen. */
export async function updateUser(
  email: string,
  patch: Partial<Omit<User, "id" | "email">>
): Promise<User | undefined> {
  const user = await findUserByEmail(email);
  if (!user) return undefined;
  const neu = { ...user, ...patch };
  await speichere(neu);
  return neu;
}

export async function updateUserTier(
  email: string,
  tier: Tier
): Promise<User | undefined> {
  return updateUser(email, { tier });
}

export async function setzeNeuesPasswort(
  email: string,
  passwort: string
): Promise<User | undefined> {
  return updateUser(email, { password: hashPasswort(passwort) });
}
