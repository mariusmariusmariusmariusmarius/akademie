import Link from "next/link";
import { Check, CreditCard, KeyRound, Mail } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/auth/users";
import { LIMIT_USD, verbrauchVon } from "@/lib/api/verbrauch";
import { CopyButton } from "@/components/ui/copy-button";
import { DomainUebersicht } from "@/components/app/domain-uebersicht";
import { PostfachUebersicht } from "@/components/app/postfach-uebersicht";
import { PLATTFORM_URL } from "@/lib/config";
import { changeTierAction } from "@/lib/auth/actions";
import { portalAction } from "@/lib/zahlung/actions";
import { buchbar } from "@/lib/zahlung/stripe";
import { darfWerkzeuge } from "@/lib/api/zugang";
import { TIERS, TIER_INFO } from "@/lib/tiers";
import { Avatar } from "@/components/ui/avatar";
import { TierBadge } from "@/components/ui/tier-badge";

export const metadata = { title: "Einstellungen" };

const TABS = [
  { id: "allgemein", name: "Allgemein" },
  { id: "zentrale", name: "Zentrale" },
  { id: "rechnung", name: "Rechnungsstellung" },
] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; zahlung?: string }>;
}) {
  const session = (await getSession())!;
  const user = await findUserByEmail(session.email);
  const verbrauch = user ? verbrauchVon(user.id) : null;
  const { tab: tabRoh, zahlung } = await searchParams;
  const tab = TABS.some((t) => t.id === tabRoh) ? tabRoh : "allgemein";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Einstellungen
        </h1>
        <p className="mt-2 text-zinc-400">Dein Account, deine Stufe, deine Daten.</p>
      </div>

      {/* Untertabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/8 bg-surface-900/70 p-1.5">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "allgemein" ? "/einstellungen" : `/einstellungen?tab=${t.id}`}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-brand-500/20 text-brand-200"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t.name}
          </Link>
        ))}
      </div>

      {tab === "allgemein" ? (
      <>

      {/* Profil */}
      <section className="rounded-3xl border border-white/8 bg-surface-900/70 p-7">
        <h2 className="mb-5 text-lg font-semibold text-white">Profil</h2>
        <div className="flex flex-wrap items-center gap-5">
          <Avatar name={session.name} gradient={session.avatarColor} size="lg" />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white">{session.name}</p>
            <p className="text-sm text-zinc-400">{session.email}</p>
            <p className="mt-1 text-xs text-zinc-600">
              Rolle: {session.role === "admin" ? "Admin" : "Mitglied"}
            </p>
          </div>
          <div className="ml-auto">
            <TierBadge tier={session.tier} />
          </div>
        </div>
        <p className="mt-5 rounded-2xl border border-dashed border-white/10 bg-surface-950/40 p-4 text-sm text-zinc-500">
          Profil bearbeiten (Name, Avatar, Passwort ändern) kommt mit der
          echten Datenbank-Anbindung.
        </p>
      </section>

      <div className="rounded-3xl border border-dashed border-white/10 bg-surface-900/40 p-7">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/5 text-zinc-400">
            <Mail className="size-5" />
          </span>
          <h3 className="font-semibold text-zinc-300">E-Mail-Benachrichtigungen</h3>
        </div>
        <p className="text-sm text-zinc-500">
          Hier kommt die Resend-Anbindung hin: Willkommens-Mails, neue
          Lektionen, Community-Antworten.
        </p>
      </div>
      </>
      ) : null}

      {tab === "zentrale" && !darfWerkzeuge(session) ? (
        <section className="rounded-3xl border border-brand-500/25 bg-gradient-to-br from-brand-600/15 to-accent-500/5 p-8 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-300">
            <KeyRound className="size-6" />
          </span>
          <h2 className="mb-2 text-xl font-semibold text-white">
            Deine Zentrale gehört zur Stufe Starter
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-zinc-400">
            Hier liegen dein persönlicher Schlüssel, das Hosting deiner Seiten,
            die Domainverwaltung samt DNS, deine Postfächer und der Zugang zu
            SEO- und Marktdaten. Alles ohne eigene Konten bei den Anbietern und
            ohne Zusatzkosten.
          </p>
          <Link
            href="/buchen?stufe=starter"
            className="inline-block rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Starter freischalten
          </Link>
        </section>
      ) : null}

      {tab === "zentrale" && darfWerkzeuge(session) ? (
      <>
      {/* Persönlicher API-Schlüssel — der eine Zugang für Hosting, Domain, Mail und Daten */}
      <section className="rounded-3xl border border-white/8 bg-surface-900/70 p-7">
        <h2 className="mb-1 flex flex-wrap items-center gap-2 text-lg font-semibold text-white">
          <KeyRound className="size-5 text-brand-300" />
          Dein API-Schlüssel
          <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-medium text-brand-300">
            Ein Schlüssel für alles
          </span>
        </h2>
        <p className="mb-4 text-sm text-zinc-400">
          Du kopierst ihn in den Prompt, den du gerade brauchst — mehr ist
          nicht zu tun. Fünf Dinge erledigt Claude damit in deinem Namen:
        </p>
        <ul className="mb-5 space-y-2.5 text-sm text-zinc-400">
          {[
            [
              "Website hosten",
              "Deine fertige Seite geht ins Netz und bekommt sofort eine Adresse zum Herzeigen. Später hängst du deine eigene Domain davor. Du brauchst dafür kein eigenes Hosting-Konto und zahlst nichts extra.",
            ],
            [
              "Domain anschließen",
              "Claude richtet deine Domain ein und nennt dir die zwei Nameserver für deinen Anbieter. Danach setzt er alle DNS-Einträge selbst — du musst nie wieder in eine DNS-Tabelle schauen.",
            ],
            [
              "Postfächer anlegen",
              "E-Mail-Adressen auf deiner eigenen Domain, dazu Weiterleitungen und Passwörter. Alles aus dem Chat, ohne Postfach beim Domain-Anbieter zu kaufen.",
            ],
            [
              "SEO- und Marktdaten",
              "Rankings, Keywords, Suchvolumen, Konkurrenz und Backlinks — dein Zugang zu DataForSEO, ohne dass du dort ein eigenes Konto brauchst.",
            ],
            [
              "Bewertungen holen",
              "Echte Kundenbewertungen von Google, Trustpilot und Co. einsammeln und mit Quellenangabe auf deine Website bauen — auf Wunsch dauerhaft aktuell gehalten.",
            ],
          ].map(([titel, text]) => (
            <li key={titel} className="flex gap-3">
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-300"
              />
              <span>
                <strong className="font-medium text-zinc-200">{titel}</strong>{" "}
                — {text}
              </span>
            </li>
          ))}
        </ul>
        <p className="mb-5 text-sm text-zinc-400">
          Der Schlüssel gehört nur dir — behandle ihn wie ein Passwort und gib
          ihn nicht weiter. Das Monatslimit unten zählt{" "}
          <strong className="font-medium text-zinc-200">nur</strong> SEO-Daten
          und Bewertungen; Hosting, Domain und Postfächer laufen nicht dagegen.
        </p>
        {user ? (
          <>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-surface-950/60 px-4 py-3">
              <code className="min-w-0 truncate font-mono text-sm text-zinc-200">
                {user.apiKey}
              </code>
              <CopyButton text={user.apiKey} />
            </div>
            {verbrauch ? (
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-widest text-zinc-500">
                    Monat
                  </dt>
                  <dd className="font-medium text-zinc-200">{verbrauch.monat}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-zinc-500">
                    Anfragen
                  </dt>
                  <dd className="font-medium text-zinc-200">{verbrauch.anfragen}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-zinc-500">
                    Verbrauch
                  </dt>
                  <dd className="font-medium text-zinc-200">
                    {verbrauch.kostenUsd.toFixed(4)} von {LIMIT_USD[session.tier]} USD
                  </dd>
                </div>
              </dl>
            ) : null}
          </>
        ) : null}
      </section>

      <DomainUebersicht />

      <PostfachUebersicht apiAdresse={`${PLATTFORM_URL}/api/mail`} />
      </>
      ) : null}

      {tab === "rechnung" ? (
      <>
      {zahlung ? (
        <div
          className={`rounded-2xl border p-5 text-sm ${
            zahlung === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-white/10 bg-surface-900/70 text-zinc-300"
          }`}
        >
          {zahlung === "ok"
            ? "Danke, die Zahlung läuft. Sobald Stripe sie bestätigt hat, steht deine neue Stufe hier. Das dauert meist nur Sekunden."
            : "Der Bezahlvorgang wurde abgebrochen. Es wurde nichts abgebucht."}
        </div>
      ) : null}

      {/* Account-Stufe */}
      <section className="rounded-3xl border border-white/8 bg-surface-900/70 p-7">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Account-Stufe</h2>
          <TierBadge tier={session.tier} />
        </div>
        <p className="mb-6 text-sm text-zinc-400">
          {session.role === "admin"
            ? "Als Admin setzt du Stufen direkt, ohne Bezahlvorgang."
            : "Deine Stufe entscheidet, welche Module offen sind. Abgerechnet wird monatlich über Stripe, kündbar zum Ende des Monats."}
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => {
            const info = TIER_INFO[tier];
            const current = tier === session.tier;
            const hatAbo = Boolean(user?.stripeKunde && user?.abo);
            return (
              <div
                key={tier}
                className={`flex flex-col rounded-2xl border p-5 ${
                  current
                    ? "border-brand-500/50 bg-brand-500/10"
                    : "border-white/8 bg-surface-950/40"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <TierBadge tier={tier} />
                  {current && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-brand-300">
                      <Check className="size-3.5" /> Aktiv
                    </span>
                  )}
                </div>
                <p className="mb-1 text-2xl font-bold text-white">
                  {info.price}
                  {info.priceHint ? (
                    <span className="ml-1 text-xs font-normal text-zinc-500">
                      {info.priceHint}
                    </span>
                  ) : null}
                </p>
                <p className="mb-4 flex-1 text-xs text-zinc-500">{info.tagline}</p>

                {current ? (
                  <span className="rounded-xl bg-white/5 py-2 text-center text-sm font-semibold text-zinc-400">
                    Deine Stufe
                  </span>
                ) : session.role === "admin" ? (
                  <form action={changeTierAction}>
                    <input type="hidden" name="tier" value={tier} />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Zu dieser Stufe wechseln
                    </button>
                  </form>
                ) : hatAbo ? (
                  <form action={portalAction}>
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-white/10 py-2 text-sm font-semibold text-zinc-200 transition hover:border-brand-500/40 hover:text-brand-200"
                    >
                      {tier === "free" ? "Abo kündigen" : "Hierhin wechseln"}
                    </button>
                  </form>
                ) : TIER_INFO[tier].demnaechst ? (
                  <span className="rounded-xl border border-dashed border-white/12 py-2 text-center text-sm font-semibold text-zinc-500">
                    Coming soon
                  </span>
                ) : buchbar(tier) ? (
                  <Link
                    href={`/buchen?stufe=${tier}`}
                    className="block rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Jetzt buchen
                  </Link>
                ) : (
                  <span className="rounded-xl bg-white/5 py-2 text-center text-sm font-semibold text-zinc-500">
                    {tier === "free" ? "Ausgangsstufe" : "Bald buchbar"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {session.role !== "admin" && buchbar("starter") ? (
          <p className="mt-5 text-xs leading-relaxed text-zinc-600">
            Preise inklusive gesetzlicher Umsatzsteuer. Das Abo verlängert sich
            monatlich und ist jederzeit zum Ende des Bezahlzeitraums kündbar.
            Es gelten die{" "}
            <Link href="/agb" className="underline hover:text-zinc-400">
              AGB samt Widerrufsbelehrung
            </Link>.
          </p>
        ) : null}
      </section>

      {/* Zahlungen & Abo */}
      <div className="rounded-3xl border border-white/8 bg-surface-900/70 p-7">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/5 text-zinc-400">
            <CreditCard className="size-5" />
          </span>
          <h3 className="font-semibold text-zinc-300">Zahlungen & Abo</h3>
        </div>

        {user?.stripeKunde ? (
          <>
            {user.abo ? (
              <dl className="mb-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-widest text-zinc-500">Abo-Status</dt>
                  <dd className="font-medium text-zinc-200">{user.abo.status}</dd>
                </div>
                {user.abo.endetAm ? (
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-zinc-500">Läuft bis</dt>
                    <dd className="font-medium text-zinc-200">
                      {new Date(user.abo.endetAm).toLocaleDateString("de-DE")}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            <p className="mb-5 text-sm text-zinc-500">
              Rechnungen, Zahlungsmittel, Adresse und Kündigung verwaltest du
              direkt bei Stripe.
            </p>
            <form action={portalAction}>
              <button
                type="submit"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-brand-500/40 hover:text-brand-200"
              >
                Rechnungen &amp; Abo verwalten
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            Sobald du eine bezahlte Stufe buchst, findest du hier deine
            Rechnungen, dein Zahlungsmittel und die Kündigung.
          </p>
        )}
      </div>

      </>
      ) : null}
    </div>
  );
}
