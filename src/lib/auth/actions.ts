"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createUser,
  findUserByEmail,
  normalisiereEmail,
  setzeNeuesPasswort,
  updateUser,
  updateUserTier,
  verifyCredentials,
} from "@/lib/auth/users";
import {
  clearedSessionCookie,
  getSession,
  sessionCookie,
} from "@/lib/auth/session";
import {
  meldeRegistrierung,
  sendePasswortMail,
  sendeWillkommensmail,
} from "@/lib/auth/mails";
import {
  loeseToken,
  merkeToken,
  verbraucheToken,
} from "@/lib/auth/reset-token";
import { TIERS, type Tier } from "@/lib/tiers";

export type AuthFormState = { error?: string };

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Bitte E-Mail und Passwort eingeben." };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return { error: "E-Mail oder Passwort ist falsch." };
  }

  // Ohne Haken endet die Anmeldung mit dem Browserfenster.
  const bleiben = formData.get("bleiben") === "ja";

  const jar = await cookies();
  jar.set(sessionCookie(user.email, bleiben));
  redirect(user.onboarding === false ? "/willkommen" : "/dashboard");
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalisiereEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Bitte alle Felder ausfüllen." };
  }
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return { error: "Diese E-Mail-Adresse sieht nicht richtig aus." };
  }
  if (password.length < 8) {
    return { error: "Das Passwort braucht mindestens 8 Zeichen." };
  }

  const { user, error } = await createUser({ name, email, password });
  if (error || !user) {
    return { error: error ?? "Registrierung fehlgeschlagen." };
  }

  // Mailversand darf die Registrierung nicht kippen: der Account steht
  // bereits. Ob die Mail rausging, wird am Nutzer vermerkt und Marius
  // bekommt in jedem Fall Bescheid.
  const zugestellt = await sendeWillkommensmail(user);
  await updateUser(user.email, {
    willkommensmail: zugestellt ? new Date().toISOString() : undefined,
  });
  await meldeRegistrierung({
    name: user.name,
    email: user.email,
    mailZugestellt: zugestellt,
  });

  const jar = await cookies();
  jar.set(sessionCookie(user.email));
  redirect("/willkommen");
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.set(clearedSessionCookie());
  redirect("/login");
}

export async function forgotPasswordAction(
  _prev: AuthFormState & { done?: boolean },
  formData: FormData
): Promise<AuthFormState & { done?: boolean }> {
  const email = normalisiereEmail(String(formData.get("email") ?? ""));
  if (!email) {
    return { error: "Bitte E-Mail-Adresse eingeben." };
  }

  // Antwort ist absichtlich immer gleich — sonst verrät das Formular,
  // welche Adressen registriert sind.
  const user = await findUserByEmail(email);
  if (user) {
    const token = await merkeToken(user.email);
    await sendePasswortMail(user.email, token);
  }
  return { done: true };
}

export async function resetPasswordAction(
  _prev: AuthFormState & { done?: boolean },
  formData: FormData
): Promise<AuthFormState & { done?: boolean }> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const wiederholung = String(formData.get("password2") ?? "");

  if (password.length < 8) {
    return { error: "Das Passwort braucht mindestens 8 Zeichen." };
  }
  if (password !== wiederholung) {
    return { error: "Die beiden Passwörter stimmen nicht überein." };
  }

  const email = await loeseToken(token);
  if (!email) {
    return {
      error:
        "Dieser Link ist abgelaufen oder wurde schon benutzt. Fordere einen neuen an.",
    };
  }

  await setzeNeuesPasswort(email, password);
  await verbraucheToken(token);
  return { done: true };
}

/** Onboarding abschließen und weiter in die Plattform. */
export async function onboardingFertigAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  const ziel = String(formData.get("ziel") ?? "").slice(0, 120);
  await updateUser(session.email, {
    ziel: ziel || undefined,
    onboarding: true,
  });
  revalidatePath("/", "layout");

  // Ziel nur aus dem eigenen Angebot — kein offener Weiterleitungspunkt.
  const weiter = String(formData.get("weiter") ?? "");
  redirect(
    weiter === "lektion"
      ? "/kurse"
      : "/dashboard"
  );
}

/**
 * Willkommens-Mail für einen Account erneut verschicken. Nur für Admins.
 * Gedacht für Fälle, in denen der Versand beim Registrieren gescheitert ist
 * oder es die Mail damals noch gar nicht gab.
 */
export async function willkommensmailErneutAction(
  formData: FormData
): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const email = normalisiereEmail(String(formData.get("email") ?? ""));
  const user = await findUserByEmail(email);
  if (!user) return;

  const zugestellt = await sendeWillkommensmail(user);
  if (zugestellt) {
    await updateUser(user.email, { willkommensmail: new Date().toISOString() });
  }
  revalidatePath("/admin");
}

/**
 * Account-Stufe von Hand setzen. Nur für Admins: solange der
 * Stripe-Checkout noch nicht steht, wird eine bezahlte Stufe manuell
 * vergeben. Ohne diese Sperre könnte sich jedes Mitglied selbst auf Pro
 * setzen und käme kostenlos an die Bezahl-Module.
 *
 * Später übernimmt das der Stripe-Webhook: Zahlung eingegangen → Stufe
 * hoch, Abo gekündigt → Stufe runter.
 */
export async function changeTierAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/einstellungen");

  const tier = String(formData.get("tier") ?? "");
  if (!(TIERS as readonly string[]).includes(tier)) return;

  const email = normalisiereEmail(String(formData.get("email") ?? "")) || session.email;
  await updateUserTier(email, tier as Tier);
  revalidatePath("/", "layout");
}
