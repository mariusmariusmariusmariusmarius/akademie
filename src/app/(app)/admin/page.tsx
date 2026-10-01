import { redirect } from "next/navigation";
import { BookOpen, Check, Database, GraduationCap, Users } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/users";
import { LIMIT_USD, verbrauchVon } from "@/lib/api/verbrauch";
import { CURRICULUM, alleLektionen, totalLessons } from "@/lib/data/curriculum";
import { TierBadge } from "@/components/ui/tier-badge";
import { Avatar } from "@/components/ui/avatar";
import { DataIcon } from "@/components/icon-map";
import { changeTierAction, willkommensmailErneutAction } from "@/lib/auth/actions";
import { TIERS, TIER_INFO } from "@/lib/tiers";
import { MailKnopf } from "@/components/app/mail-knopf";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = (await getSession())!;
  // Nur Admins — alle anderen landen im Dashboard
  if (session.role !== "admin") redirect("/dashboard");

  const users = await listUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Admin</h1>
        <p className="mt-2 text-zinc-400">
          Dein Cockpit: Nutzer, Inhalte und später alles, was die Plattform steuert.
        </p>
      </div>

      {/* Kennzahlen */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, value: users.length, label: "Registrierte Nutzer" },
          {
            icon: GraduationCap,
            value: CURRICULUM.filter((m) => !m.nurAdmin).length,
            label: "Module sichtbar",
          },
          { icon: BookOpen, value: totalLessons(), label: "Lektionen sichtbar" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/8 bg-surface-900/70 p-6">
            <div className="mb-4 inline-grid size-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <stat.icon className="size-5" />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Nutzerverwaltung */}
      <section className="rounded-3xl border border-white/8 bg-surface-900/70 p-7">
        <h2 className="mb-5 text-lg font-semibold text-white">Nutzer</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs uppercase tracking-widest text-zinc-500">
                <th className="pb-3 pr-4 font-medium">Nutzer</th>
                <th className="pb-3 pr-4 font-medium">Stufe</th>
                <th className="pb-3 pr-4 font-medium">Rolle</th>
                <th className="pb-3 pr-4 font-medium">Willkommens-Mail</th>
                <th className="pb-3 font-medium">Dabei seit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} gradient={user.avatarColor} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{user.name}</p>
                        <p className="truncate text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <TierBadge tier={user.tier} />
                    {/* Stufe von Hand vergeben, bis der Stripe-Checkout steht */}
                    <div className="mt-1.5 flex items-center gap-1">
                      {TIERS.filter((t) => t !== user.tier).map((t) => (
                        <form key={t} action={changeTierAction}>
                          <input type="hidden" name="email" value={user.email} />
                          <input type="hidden" name="tier" value={t} />
                          <button
                            type="submit"
                            className="rounded-md border border-white/8 px-1.5 py-0.5 text-[11px] text-zinc-500 transition hover:border-brand-500/40 hover:text-brand-300"
                          >
                            &rarr; {TIER_INFO[t].label}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-zinc-400">
                    {user.role === "admin" ? "Admin" : "Mitglied"}
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      {user.willkommensmail ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                          <Check className="size-3.5" />
                          verschickt
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">offen</span>
                      )}
                      <form action={willkommensmailErneutAction}>
                        <input type="hidden" name="email" value={user.email} />
                        <MailKnopf erneut={Boolean(user.willkommensmail)} email={user.email} />
                      </form>
                    </div>
                  </td>
                  <td className="py-3.5 text-zinc-500">{user.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-zinc-600">
          Die Liste kommt aus dem dauerhaften Speicher, Registrierungen
          überleben jeden Neustart. Die Stufe vergibst du hier von Hand,
          solange der Stripe-Checkout noch nicht steht. Sperren und Löschen
          kommen als Nächstes.
        </p>
      </section>

      {/* Bewertungs-API: wer verbraucht wie viel */}
      <section className="rounded-3xl border border-white/8 bg-surface-900/70 p-7">
        <h2 className="mb-4 text-lg font-semibold text-white">
          DataForSEO-Verbrauch im laufenden Monat (SEO-Daten & Bewertungen)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-zinc-500">
                <th className="pb-3 pr-4">Konto</th>
                <th className="pb-3 pr-4">Schlüssel</th>
                <th className="pb-3 pr-4">Anfragen</th>
                <th className="pb-3 pr-4">Kosten (USD)</th>
                <th className="pb-3">Limit</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const v = verbrauchVon(u.id);
                return (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-zinc-200">{u.email}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-500">
                      …{u.apiKey.slice(-8)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">{v.anfragen}</td>
                    <td className="py-3 pr-4 text-zinc-300">{v.kostenUsd.toFixed(4)}</td>
                    <td className="py-3 text-zinc-300">{LIMIT_USD[u.tier]} USD</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-zinc-600">
          Die Kosten stammen aus dem cost-Feld jeder DataForSEO-Antwort — hier
          in deren Einkaufspreis. Dein Verkaufspreis ist deine Sache.
        </p>
      </section>

      {/* Inhalte */}
      <section className="rounded-3xl border border-white/8 bg-surface-900/70 p-7">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Inhalte</h2>
          <p className="text-xs text-zinc-500">
            {alleLektionen()} Lektionen insgesamt, davon {totalLessons()} für
            Teilnehmer sichtbar. „In Planung" sieht nur dieser Bereich.
          </p>
        </div>
        <div className="space-y-3">
          {CURRICULUM.map((mod) => (
            <div
              key={mod.slug}
              className="flex items-center gap-4 rounded-2xl border border-white/8 bg-surface-950/40 p-4"
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${mod.gradient}`}>
                <DataIcon name={mod.icon} className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{mod.title}</p>
                <p className="text-xs text-zinc-500">{mod.lessons.length} Lektionen</p>
              </div>
              {mod.nurAdmin ? (
                <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                  In Planung
                </span>
              ) : (
                <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  Sichtbar
                </span>
              )}
              <TierBadge tier={mod.tier} />
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap-Hinweis */}
      <section className="rounded-3xl border border-dashed border-white/10 bg-surface-900/40 p-7">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/5 text-zinc-400">
            <Database className="size-5" />
          </span>
          <h3 className="font-semibold text-zinc-300">Als Nächstes hier</h3>
        </div>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-500">
          <li>Lektionen anlegen & bearbeiten (statt statischer Curriculum-Datei)</li>
          <li>Video-Uploads für Kursinhalte</li>
          <li>Community-Moderation (Beiträge anpinnen, löschen)</li>
          <li>Umsatz-Übersicht aus Stripe</li>
        </ul>
      </section>
    </div>
  );
}
