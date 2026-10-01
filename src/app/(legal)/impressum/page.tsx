export const metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default function ImpressumPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Impressum</h1>
      <section className="space-y-4 text-sm leading-relaxed text-zinc-400">
        <p>
          <strong className="text-zinc-200">Angaben gemäß § 5 DDG</strong>
          <br />
          Marius Müller · Marius Müller Media
          <br />
          Pont-a-Mousson Ring 89
          <br />
          66849 Landstuhl
        </p>
        <p>
          <strong className="text-zinc-200">Kontakt</strong>
          <br />
          E-Mail: info@gefundenwerden.online
          <br />
          Telefon: 0160-3205027
        </p>
        <p>
          <strong className="text-zinc-200">Umsatzsteuer-ID</strong>
          <br />
          DE362120118
        </p>
        <p>
          <strong className="text-zinc-200">Verantwortlich für den Inhalt</strong>
          <br />
          Marius Müller, Pont-a-Mousson Ring 89, 66849 Landstuhl
        </p>
      </section>
    </article>
  );
}
