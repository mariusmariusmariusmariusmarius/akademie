import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { TIERS, TIER_INFO, type Tier } from "@/lib/tiers";
import { buchbar } from "@/lib/zahlung/stripe";
import { Bezahlmaske } from "@/components/app/bezahlmaske";
import { TierBadge } from "@/components/ui/tier-badge";

export const metadata = { title: "Buchen" };

export default async function BuchenPage({
  searchParams,
}: {
  searchParams: Promise<{ stufe?: string }>;
}) {
  const session = (await getSession())!;
  const { stufe: roh } = await searchParams;

  const stufe = (TIERS as readonly string[]).includes(roh ?? "")
    ? (roh as Tier)
    : "starter";

  // Nicht buchbar heißt: gar nicht erst anzeigen.
  if (!buchbar(stufe)) redirect("/einstellungen?tab=rechnung");
  if (session.tier === stufe) redirect("/einstellungen?tab=rechnung");

  const info = TIER_INFO[stufe];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/einstellungen?tab=rechnung"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="size-4" /> Zurück zu den Einstellungen
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {info.label} buchen
        </h1>
        <p className="mt-2 text-zinc-400">{info.tagline}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Was drin ist */}
        <section className="h-fit rounded-3xl border border-white/8 bg-surface-900/70 p-7">
          <div className="mb-4 flex items-center justify-between">
            <TierBadge tier={stufe} />
            <p className="text-2xl font-bold text-white">
              {info.price}
              <span className="ml-1 text-xs font-normal text-zinc-500">
                {info.priceHint}
              </span>
            </p>
          </div>
          <ul className="space-y-3">
            {info.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                  <Check className="size-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-zinc-600">
            Preis inklusive gesetzlicher Umsatzsteuer. Monatliche Laufzeit, die
            sich verlängert, jederzeit zum Ende des Bezahlzeitraums kündbar. Es
            gelten die{" "}
            <Link href="/agb" className="underline hover:text-zinc-400">AGB</Link>{" "}
            und die{" "}
            <Link href="/widerruf" className="underline hover:text-zinc-400">
              Widerrufsbelehrung
            </Link>
            .
          </p>
        </section>

        {/* Bezahlmaske, eingebettet */}
        <section>
          <Bezahlmaske stufe={stufe} preis={info.price} />
        </section>
      </div>
    </div>
  );
}
