import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Play } from "lucide-react";
import { Logo } from "@/components/logo";
import { SocialLinks } from "@/components/social-links";
import { Reveal } from "@/components/motion-primitives";
import { Befehl } from "@/components/ressourcen/befehl";
import { Brotkrumen } from "@/components/ressourcen/brotkrumen";
import { SeitenNavigation } from "@/components/ressourcen/seiten-navigation";
import { getVideo, promptsAus, VIDEOS } from "@/lib/data/videos";

export function generateStaticParams() {
  return VIDEOS.map((v) => ({ video: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ video: string }>;
}) {
  const { video } = await params;
  const daten = getVideo(video);
  if (!daten) return { title: "Nicht gefunden" };
  return {
    title: daten.titel,
    description: daten.kurz,
    alternates: { canonical: `/ressourcen/${video}` },
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ video: string }>;
}) {
  const { video } = await params;
  const daten = getVideo(video);
  if (!daten) notFound();

  const navPunkte = daten.kapitel.map((k) => ({
    id: k.id,
    titel: k.titel,
  }));

  return (
    <div className="bg-noise flex min-h-screen flex-col">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Logo />
          <nav className="flex items-center gap-6 text-sm text-zinc-400">
            <Link
              href="/ressourcen"
              className="hidden items-center gap-2 transition hover:text-white sm:flex"
            >
              <ArrowLeft className="size-4" /> Alle Ressourcen
            </Link>
            <Link
              href="/registrieren"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-zinc-200 transition hover:border-white/20 hover:text-white"
            >
              Zur Academy
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl grow px-4 pb-24 pt-14">
        <div className="gap-12 lg:grid lg:grid-cols-[190px_minmax(0,1fr)]">
          <SeitenNavigation punkte={navPunkte} />

          <div className="min-w-0">
            <Reveal>
              <Brotkrumen
                krumen={[
                  { name: "Start", href: "/" },
                  { name: "Ressourcen", href: "/ressourcen" },
                  { name: `Video ${daten.nummer}` },
                ]}
              />
              <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                Video {daten.nummer}
                <span className="font-normal tracking-normal text-zinc-600">
                  {daten.dauer}
                </span>
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
                {daten.titel}
              </h1>
              {daten.einleitung.map((absatz) => (
                <p
                  key={absatz}
                  className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400"
                >
                  {absatz}
                </p>
              ))}

              {daten.youtubeId ? (
                <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
                  <iframe
                    className="aspect-video w-full"
                    src={`https://www.youtube-nocookie.com/embed/${daten.youtubeId}`}
                    title={daten.titel}
                    allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-400">
                  <Play className="size-4 text-brand-300" />
                  Das Video kommt in Kürze — die Prompts stehen schon hier.
                </p>
              )}
            </Reveal>

            <div className="mt-16 space-y-16">
              {daten.kapitel.map((kapitel) => {
                const prompts = [
                  ...(kapitel.prompts ?? []),
                  ...(kapitel.quellen ?? []).flatMap(promptsAus),
                ];

                return (
                  <Reveal key={kapitel.id}>
                    <section id={kapitel.id} className="scroll-mt-8">
                      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="font-mono text-sm text-brand-300">
                          {kapitel.zeit}
                        </span>
                        <h2 className="text-2xl font-bold tracking-tight text-white">
                          {kapitel.titel}
                        </h2>
                      </div>

                      <div className="max-w-2xl space-y-4">
                        {kapitel.text.map((absatz) => (
                          <p
                            key={absatz}
                            className="leading-relaxed text-zinc-400"
                          >
                            {absatz}
                          </p>
                        ))}
                      </div>

                      {prompts.length > 0 ? (
                        <div className="mt-6 space-y-4">
                          {prompts.map((prompt, i) => (
                            /* Eigener Anker je Prompt, damit aus der
                               YouTube-Beschreibung direkt auf genau einen
                               Prompt verlinkt werden kann: #logo-2, #domain-4.
                               Ab 1 gezählt, so wie im Video gesprochen wird. */
                            <div
                              key={`${kapitel.id}-${i}`}
                              id={`${kapitel.id}-${i + 1}`}
                              className="scroll-mt-8"
                            >
                              <Befehl
                                os={prompt.os}
                                label={prompt.label ?? "Prompt"}
                                text={prompt.text}
                                hoch
                              />
                            </div>
                          ))}
                        </div>
                      ) : kapitel.keinPrompt ? (
                        <p className="mt-6 max-w-2xl rounded-xl border border-white/8 bg-surface-900/50 px-4 py-3 text-sm text-zinc-500">
                          {kapitel.keinPrompt}
                        </p>
                      ) : null}

                      {kapitel.links?.length ? (
                        <ul className="mt-6 space-y-2">
                          {kapitel.links.map((link) => (
                            <li key={link.href}>
                              <a
                                href={link.href}
                                target={
                                  link.href.startsWith("http")
                                    ? "_blank"
                                    : undefined
                                }
                                rel={
                                  link.href.startsWith("http")
                                    ? "noreferrer"
                                    : undefined
                                }
                                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-brand-300"
                              >
                                {link.label}
                                <ExternalLink className="size-3 text-zinc-600" />
                                {link.note ? (
                                  <span className="text-xs text-zinc-600">
                                    {link.note}
                                  </span>
                                ) : null}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  </Reveal>
                );
              })}
            </div>

            <Reveal>
              <section className="mt-20 rounded-3xl border border-white/8 bg-surface-900/50 p-8 md:p-10">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Weiter als das Video geht
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
                  Das Video zeigt den Weg von der leeren Seite bis zur eigenen
                  Domain. Was danach kommt — Anfragen empfangen, Bewertungen
                  einbinden, lokale Landingpages, die eigene Admin-App — steht
                  in der Academy, Schritt für Schritt.
                </p>
                <Link
                  href="/registrieren"
                  className="group mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30"
                >
                  Zur Academy
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </section>
            </Reveal>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 bg-surface-900/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
            <Link href="/ressourcen" className="transition hover:text-white">
              Ressourcen
            </Link>
            <Link href="/impressum" className="transition hover:text-white">
              Impressum
            </Link>
            <Link href="/datenschutz" className="transition hover:text-white">
              Datenschutz
            </Link>
            <Link href="/agb" className="transition hover:text-white">
              AGB
            </Link>
            <Link href="/widerruf" className="transition hover:text-white">
              Widerruf
            </Link>
            <Link href="/kuendigen" className="transition hover:text-white">
              Verträge hier kündigen
            </Link>
          </nav>
          <div className="flex shrink-0 flex-col items-center gap-2 md:items-end">
            {/* -mr-3 gleicht den Innenabstand der Knöpfe aus, damit das X mit der Zeile darunter abschließt. */}
            <SocialLinks className="md:-mr-3" />
            <p className="whitespace-nowrap text-sm text-zinc-500">© 2026 <a href="https://gefundenwerden.online" className="transition hover:text-white">gefundenwerden.online</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
