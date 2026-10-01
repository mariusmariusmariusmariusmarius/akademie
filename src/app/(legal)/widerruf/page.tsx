export const metadata = {
  title: "Widerrufsbelehrung",
  alternates: { canonical: "/widerruf" },
};

export default function WiderrufPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Widerrufsbelehrung
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          für Verbraucher. Stand: September 2026.
        </p>
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
        <h2 className="text-base font-semibold text-zinc-200">Widerrufsrecht</h2>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
          Tage ab dem Tag des Vertragsabschlusses.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
        </p>
        <p className="text-zinc-300">
          Marius Müller · Marius Müller Media
          <br />
          Pont-a-Mousson Ring 89, 66849 Landstuhl
          <br />
          E-Mail: info@gefundenwerden.online
          <br />
          Telefon: 0160-3205027
        </p>
        <p>
          mittels einer eindeutigen Erklärung (z. B. ein mit der Post
          versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen
          Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte
          Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben
          ist.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die
          Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der
          Widerrufsfrist absenden.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
        <h2 className="text-base font-semibold text-zinc-200">
          Folgen des Widerrufs
        </h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen
          vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
          Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese
          Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
          ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen
          wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden
          Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
        <p>
          Haben Sie verlangt, dass die Dienstleistung während der
          Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen
          Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem
          Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses
          Vertrags unterrichten, bereits erbrachten Dienstleistungen im
          Vergleich zum Gesamtumfang der im Vertrag vorgesehenen
          Dienstleistungen entspricht.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
        <h2 className="text-base font-semibold text-zinc-200">
          Muster-Widerrufsformular
        </h2>
        <p className="text-zinc-500">
          Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses
          Formular aus und senden Sie es zurück.
        </p>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/8 bg-surface-950/60 p-5 text-xs leading-relaxed text-zinc-300">
{`An
Marius Müller · Marius Müller Media
Pont-a-Mousson Ring 89
66849 Landstuhl
E-Mail: info@gefundenwerden.online

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen
Vertrag über die Erbringung der folgenden Dienstleistung:

  Mitgliedschaft in der gefundenwerden.online Academy,
  Stufe .............................................

- Bestellt am (*) / erhalten am (*) ................
- Name des/der Verbraucher(s) ......................
- Anschrift des/der Verbraucher(s) .................
  ..................................................
- Unterschrift des/der Verbraucher(s)
  (nur bei Mitteilung auf Papier) ..................
- Datum ............................................

(*) Unzutreffendes streichen.`}
        </pre>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
        <h2 className="text-base font-semibold text-zinc-200">
          Hinweis für Unternehmer
        </h2>
        <p>
          Das Widerrufsrecht besteht nur für Verbraucher. Wer den Vertrag in
          Ausübung einer gewerblichen oder selbständigen beruflichen
          Tätigkeit abschließt, hat kein gesetzliches Widerrufsrecht. Kündigen
          ist selbstverständlich trotzdem jederzeit zum Ende des laufenden
          Monats möglich.
        </p>
      </section>
    </article>
  );
}
