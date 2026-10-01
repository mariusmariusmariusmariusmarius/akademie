import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  KeyRound,
  Terminal,
  Wrench,
  MonitorPlay,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { SocialLinks } from "@/components/social-links";
import { OsIcon } from "@/components/ui/os-icon";
import { Reveal } from "@/components/motion-primitives";
import { Befehl } from "@/components/ressourcen/befehl";
import { Brotkrumen } from "@/components/ressourcen/brotkrumen";
import { SeitenNavigation } from "@/components/ressourcen/seiten-navigation";
import {
  installBefehl,
  SETUP,
  SETUP_INHALT,
  SKILL_ANZAHL,
  SKILL_GRUPPEN,
  WERKZEUGE,
  type SkillEintrag,
} from "@/lib/data/ressourcen";
import { VIDEOS } from "@/lib/data/videos";

/* Die Sprungleiste kennt genau die Abschnitte, die es unten auch gibt. */
const NAV_PUNKTE = [
  { id: "videos", titel: "Zu den Videos", anzahl: VIDEOS.length },
  { id: "setup", titel: "Das Setup" },
  { id: "werkzeuge", titel: "Werkzeuge", anzahl: WERKZEUGE.length },
  ...SKILL_GRUPPEN.map((g) => ({
    id: g.slug,
    titel: g.kurz ?? g.titel,
    anzahl: g.eintraege.length,
  })),
];

export const metadata = {
  alternates: { canonical: "/ressourcen" },
  title: "Ressourcen",
  description:
    "Alles zum Mitmachen aus den Videos: das Setup für Mac und Windows, alle verwendeten Claude-Skills mit Installationsbefehl und der WebsiteLoader. Kostenlos, ohne Account.",
};

/** Eine Skill-Karte — Name, was er kann, und wie man ihn holt. */
function SkillKarte({
  eintrag,
  befehlZeigen,
}: {
  eintrag: SkillEintrag;
  befehlZeigen: boolean;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-surface-900/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <code className="font-mono text-sm font-semibold text-brand-300">
          {eintrag.name}
        </code>
        {eintrag.schluessel ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gold-400/30 bg-gold-500/10 px-2 py-0.5 text-[11px] font-medium text-gold-400">
            <KeyRound className="size-3" /> mm_-Schlüssel
          </span>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">{eintrag.text}</p>
      {befehlZeigen ? (
        <Befehl label="Installieren" text={installBefehl(eintrag)} />
      ) : null}
      {eintrag.href ? (
        <a
          href={eintrag.href}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex w-fit items-center gap-1.5 text-xs text-zinc-500 transition hover:text-brand-300"
        >
          {eintrag.repo} <ExternalLink className="size-3" />
        </a>
      ) : null}
    </li>
  );
}

export default function RessourcenPage() {
  return (
    <div className="bg-noise flex min-h-screen flex-col">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <Logo />
          <nav className="flex items-center gap-6 text-sm text-zinc-400">
            <Link
              href="/"
              className="hidden transition hover:text-white sm:inline"
            >
              Startseite
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
          <SeitenNavigation punkte={NAV_PUNKTE} />

          <div className="min-w-0">
            {/* Kopf */}
            <Reveal>
              <Brotkrumen
                krumen={[{ name: "Start", href: "/" }, { name: "Ressourcen" }]}
              />
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                Werkzeugkiste
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
                Alles aus den Videos —{" "}
                <span className="text-gradient">zum Mitmachen.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
                Das Setup, jeder Skill, den ich verwende, und die Werkzeuge
                dazu. Kein Account nötig, nichts kostet etwas. Wenn du in einem
                Video hörst „den Befehl findet ihr in der Beschreibung“ — hier
                ist er.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                {[
                  [String(SKILL_ANZAHL), "Skills"],
                  ["1", "Befehl für alle"],
                  ["0 €", "Kosten"],
                ].map(([wert, name]) => (
                  <div key={name}>
                    <p className="font-display text-2xl font-bold text-white">
                      {wert}
                    </p>
                    <p className="text-sm text-zinc-500">{name}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Videos */}
            <Reveal delay={0.05}>
              <section id="videos" className="mt-16 scroll-mt-8">
                <div className="mb-6 flex items-center gap-2 text-brand-300">
                  <MonitorPlay className="size-4" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest">
                    Zu den Videos
                  </h2>
                </div>
                <p className="mb-6 max-w-2xl text-zinc-400">
                  Zu jedem Video eine eigene Seite: Kapitel für Kapitel
                  nachlesen, was passiert — mit den Prompts zum Kopieren.
                </p>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {VIDEOS.map((video) => (
                    <li key={video.slug}>
                      <Link
                        href={`/ressourcen/${video.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-white/8 bg-surface-900/50 p-5 transition hover:border-brand-500/40"
                      >
                        <p className="mb-2 flex items-center gap-3 text-xs text-zinc-600">
                          <span className="font-mono text-brand-300">
                            Video {video.nummer}
                          </span>
                          {video.dauer}
                          {video.youtubeId ? null : <span>· bald online</span>}
                        </p>
                        <h3 className="text-base font-semibold text-white">
                          {video.titel}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                          {video.kurz}
                        </p>
                        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs text-zinc-500 transition group-hover:text-brand-300">
                          {video.kapitel.length} Kapitel mit Prompts
                          <ArrowRight className="size-3" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            {/* Setup */}
            <Reveal delay={0.08}>
              <section
                id="setup"
                className="mt-16 scroll-mt-8 rounded-3xl border border-brand-500/25 bg-brand-500/5 p-6 md:p-8"
              >
                <div className="mb-6 flex items-center gap-2 text-brand-300">
                  <Terminal className="size-4" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest">
                    Das Setup
                  </h2>
                </div>
                <p className="mb-6 max-w-2xl text-zinc-300">
                  Ein Befehl, einmal ins Terminal. Danach ist alles installiert,
                  was im Kurs vorkommt — die Programme darunter und sämtliche
                  Skills von dieser Seite.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Befehl
                    os="mac"
                    label="Mac — Terminal öffnen mit ⌘ + Leertaste, „Terminal“ tippen"
                    text={SETUP.mac}
                  />
                  <Befehl
                    os="win"
                    label="Windows — Windows-Taste + R, „powershell“ tippen"
                    text={SETUP.win}
                  />
                </div>

                <div className="mt-8 grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-white">
                      Was dabei installiert wird
                    </h3>
                    <ul className="space-y-2">
                      {SETUP_INHALT.map((zeile) => (
                        <li
                          key={zeile}
                          className="flex gap-3 text-sm leading-relaxed text-zinc-400"
                        >
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-brand-400" />
                          {zeile}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-white">
                      Nur das Nötigste
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                      Wenn du schon eine eingerichtete Umgebung hast und nur
                      Node und{" "}
                      <code className="font-mono text-zinc-300">
                        find-skills
                      </code>{" "}
                      brauchst:
                    </p>
                    <div className="space-y-3">
                      <Befehl os="mac" label="Mac" text={SETUP.macKlein} />
                      <Befehl os="win" label="Windows" text={SETUP.winKlein} />
                    </div>
                  </div>
                </div>

                <p className="mt-8 border-t border-white/10 pt-5 text-sm leading-relaxed text-zinc-500">
                  Das Skript ist offen einsehbar — es installiert ausschließlich
                  die offiziellen Pakete der jeweiligen Hersteller. Starte
                  Claude Code einmal neu, wenn es durchgelaufen ist.
                </p>
              </section>
            </Reveal>

            {/* Werkzeuge */}
            <Reveal delay={0.05}>
              <section id="werkzeuge" className="mt-16 scroll-mt-8">
                <div className="mb-6 flex items-center gap-2 text-brand-300">
                  <Wrench className="size-4" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest">
                    Werkzeuge
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {WERKZEUGE.map((w) => (
                    <div
                      key={w.name}
                      className="flex flex-col rounded-2xl border border-white/8 bg-surface-900/50 p-5"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-base font-semibold text-white">
                          {w.name}
                        </h3>
                        <span className="text-xs text-zinc-600">
                          {w.herkunft}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        {w.text}
                      </p>
                      {w.hinweis ? (
                        <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold-400/25 bg-gold-500/10 px-2.5 py-1 text-xs text-gold-400">
                          <OsIcon os="mac" /> {w.hinweis}
                        </p>
                      ) : null}
                      <p className="mt-4 font-mono text-xs text-zinc-500">
                        {w.datei}
                      </p>
                      <a
                        href={w.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3 text-xs text-zinc-500 transition hover:text-brand-300"
                      >
                        Quelltext ansehen <ExternalLink className="size-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            {/* Skills */}
            <section className="mt-20">
              <Reveal>
                <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Die Skills
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-zinc-400">
                  Ein Skill ist eine Anleitung für Claude: Anforderungen,
                  Checklisten und Wissen zu genau einer Art von Aufgabe. Er ist
                  der Kompass, an dem Claude sich durch die Aufgabe hangelt.
                  Alle hier stehen offen auf{" "}
                  <a
                    href="https://www.skills.sh"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-300 underline decoration-brand-300/30 underline-offset-4 transition hover:decoration-brand-300"
                  >
                    skills.sh
                  </a>{" "}
                  — das Setup oben holt sie in einem Rutsch.
                </p>
              </Reveal>

              <div className="mt-10 space-y-14">
                {SKILL_GRUPPEN.map((gruppe) => {
                  /* Kommt alles aus demselben Paket, reicht ein Befehl für die
                 ganze Gruppe — sonst steht er auf jeder Karte. */
                  const einPaket =
                    gruppe.eintraege.length > 1 &&
                    gruppe.eintraege.every(
                      (e) => e.repo === gruppe.eintraege[0].repo && !e.skill,
                    );

                  return (
                    <Reveal key={gruppe.slug}>
                      <div id={gruppe.slug} className="scroll-mt-8">
                        <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h3 className="text-xl font-semibold text-white">
                            {gruppe.titel}
                          </h3>
                          <span className="font-mono text-sm text-zinc-600">
                            {gruppe.eintraege.length}
                          </span>
                        </div>
                        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-zinc-400">
                          {gruppe.text}
                        </p>

                        {einPaket ? (
                          <div className="mb-6 max-w-xl">
                            <Befehl
                              label={`Alle ${gruppe.eintraege.length} auf einmal installieren`}
                              text={installBefehl(gruppe.eintraege[0])}
                            />
                          </div>
                        ) : null}

                        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {gruppe.eintraege.map((eintrag) => (
                            <SkillKarte
                              key={eintrag.name}
                              eintrag={eintrag}
                              befehlZeigen={!einPaket}
                            />
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </section>

            {/* Abschluss */}
            <Reveal>
              <section className="mt-20 rounded-3xl border border-white/8 bg-surface-900/50 p-8 md:p-10">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Und wie man das alles zusammensetzt?
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
                  Die Werkzeuge sind das eine, die Reihenfolge das andere. In
                  der Academy gehen wir Schritt für Schritt durch — von der
                  ersten Zeile bis zur Website, die live ist und Anfragen
                  bringt.
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
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
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
