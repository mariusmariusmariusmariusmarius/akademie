export const metadata = { title: "AGB", alternates: { canonical: "/agb" } };

import Link from "next/link";

/** Ein Abschnitt der AGB. Nummer und Überschrift stehen fett darüber. */
function Absatz({
  nr,
  titel,
  children,
}: {
  nr: string;
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-zinc-200">
        {nr}. {titel}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-zinc-400">{children}</div>
    </section>
  );
}

export default function AgbPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          für die Nutzung der gefundenwerden.online Academy. Stand: September 2026.
        </p>
      </div>

      <Absatz nr="1" titel="Anbieter und Geltungsbereich">
        <p>
          Anbieter der Academy ist Marius Müller, Marius Müller Media,
          Pont-a-Mousson Ring 89, 66849 Landstuhl, E-Mail
          info@gefundenwerden.online, Telefon 0160-3205027,
          Umsatzsteuer-Identifikationsnummer DE362120118 (nachfolgend „wir").
        </p>
        <p>
          Diese Bedingungen gelten für alle Verträge über die Nutzung der
          Lernplattform unter academy.gefundenwerden.online, also für den
          kostenlosen Zugang, die kostenpflichtigen Stufen Starter und Pro
          sowie für das darin enthaltene Coaching.
        </p>
        <p>
          Verbraucher ist, wer den Vertrag zu Zwecken abschließt, die
          überwiegend weder der gewerblichen noch der selbständigen
          beruflichen Tätigkeit zugerechnet werden können. Unternehmer ist,
          wer bei Abschluss in Ausübung seiner gewerblichen oder selbständigen
          beruflichen Tätigkeit handelt. Abweichende Bedingungen des Kunden
          gelten nur, wenn wir ihnen ausdrücklich in Textform zustimmen.
        </p>
      </Absatz>

      <Absatz nr="2" titel="Leistung">
        <p>
          Wir stellen digitale Lerninhalte bereit: Videolektionen, Texte,
          Vorlagen, Prompts und Werkzeuge rund um den Aufbau einer eigenen
          Website und eines eigenen Online-Geschäfts. Welche Inhalte offen
          sind, richtet sich nach der gebuchten Stufe. Der jeweils aktuelle
          Umfang steht auf der Preisseite und in der Kursübersicht.
        </p>
        <p>
          In der Stufe Pro ist zusätzlich ein persönliches Coaching von
          30 Minuten pro Woche enthalten. Termine werden über die Plattform
          vereinbart. Nicht wahrgenommene Wochen verfallen und werden nicht
          nachgeholt oder ausgezahlt.
        </p>
        <p>
          Wir entwickeln die Inhalte laufend weiter und dürfen sie ergänzen,
          überarbeiten oder ersetzen, solange der vertraglich geschuldete
          Gesamtnutzen erhalten bleibt. Ein Anspruch auf den unveränderten
          Fortbestand einer einzelnen Lektion besteht nicht.
        </p>
        <p>
          Wir schulden keinen wirtschaftlichen Erfolg. Ob und wie gut ein
          Projekt läuft, hängt von der eigenen Umsetzung, dem Markt und
          Umständen ab, auf die wir keinen Einfluss haben.
        </p>
      </Absatz>

      <Absatz nr="3" titel="Vertragsschluss">
        <p>
          Die Darstellung der Stufen auf der Website ist kein bindendes
          Angebot, sondern eine Aufforderung zur Bestellung. Mit der
          Registrierung entsteht ein kostenloser Account (Stufe Free). Ein
          kostenpflichtiger Vertrag kommt zustande, indem du im Bezahlvorgang
          eine Stufe auswählst und den Vorgang mit der Zahlungsschaltfläche
          abschließt. Wir bestätigen den Vertrag anschließend per E-Mail.
        </p>
        <p>
          Der Vertragstext wird von uns gespeichert. Du erhältst diese
          Bedingungen zusammen mit der Bestätigungs-E-Mail und kannst sie
          jederzeit auf dieser Seite abrufen.
        </p>
        <p>
          Vertragssprache ist Deutsch. Der Zugang ist persönlich. Zugangsdaten
          dürfen nicht weitergegeben werden, ein Account darf nicht von
          mehreren Personen genutzt werden.
        </p>
      </Absatz>

      <Absatz nr="4" titel="Preise und Zahlung">
        <p>
          Es gelten die zum Zeitpunkt der Bestellung auf der Website
          angegebenen Preise. Alle Preise sind Endpreise und enthalten die
          gesetzliche Umsatzsteuer. Die Abrechnung erfolgt monatlich im
          Voraus, jeweils zum Tag des Vertragsschlusses.
        </p>
        <p>
          Die Zahlung wickeln wir über Stripe ab (Stripe Payments Europe,
          Limited, Dublin, Irland). Welche Zahlungsarten zur Verfügung stehen,
          zeigt der Bezahlvorgang. Zahlungsdaten wie Kartennummer oder IBAN
          gibst du direkt bei Stripe ein, wir sehen und speichern sie nicht.
        </p>
        <p>
          Rechnungen, Zahlungsmittel und Abo findest du nach dem Einloggen
          unter Einstellungen im Reiter Rechnungsstellung.
        </p>
        <p>
          Kommt eine Zahlung nicht zustande, etwa wegen einer abgelaufenen
          Karte oder mangelnder Deckung, versuchen wir den Einzug erneut. Bis
          zum Ausgleich dürfen wir den Zugang zu den kostenpflichtigen
          Inhalten aussetzen. Der kostenlose Bereich bleibt erreichbar.
        </p>
        <p>
          Wir dürfen die Preise für laufende Verträge mit einer Frist von
          sechs Wochen zum Ende eines Abrechnungszeitraums in Textform
          ändern. Widersprichst du der Änderung bis zu ihrem Wirksamwerden,
          endet der Vertrag zu diesem Zeitpunkt. Auf dieses Recht weisen wir
          in der Ankündigung gesondert hin.
        </p>
      </Absatz>

      <Absatz nr="5" titel="Laufzeit und Kündigung">
        <p>
          Der kostenpflichtige Vertrag läuft einen Monat und verlängert sich
          jeweils um einen weiteren Monat, wenn er nicht vorher gekündigt
          wird. Er ist jederzeit zum Ende des laufenden Abrechnungszeitraums
          kündbar, ohne Frist und ohne Angabe von Gründen.
        </p>
        <p>
          Kündigen kannst du jederzeit selbst: eingeloggt unter Einstellungen
          im Reiter Rechnungsstellung, oder ohne Login über die Schaltfläche{" "}
          <Link href="/kuendigen" className="underline transition hover:text-zinc-200">
            Verträge hier kündigen
          </Link>
          . Eine formlose Erklärung per E-Mail genügt ebenfalls.
        </p>
        <p>
          Bis zum Ende des bezahlten Zeitraums bleibt der Zugang bestehen.
          Danach fällt der Account auf die kostenlose Stufe zurück, die
          Inhalte der bezahlten Stufen sind dann nicht mehr abrufbar. Der
          kostenlose Account bleibt bestehen, bis du ihn löschst.
        </p>
        <p>
          Das Recht zur außerordentlichen Kündigung aus wichtigem Grund
          bleibt für beide Seiten unberührt. Ein wichtiger Grund liegt für uns
          insbesondere vor, wenn Zugangsdaten weitergegeben oder Inhalte
          unberechtigt verbreitet werden.
        </p>
      </Absatz>

      <Absatz nr="6" titel="Widerrufsrecht">
        <p>
          Verbrauchern steht ein gesetzliches Widerrufsrecht von 14 Tagen zu.
          Die Einzelheiten und das Muster-Widerrufsformular stehen in der{" "}
          <Link href="/widerruf" className="underline transition hover:text-zinc-200">
            Widerrufsbelehrung
          </Link>
          .
        </p>
      </Absatz>

      <Absatz nr="7" titel="Nutzungsrechte an den Inhalten">
        <p>
          Alle Inhalte der Academy sind urheberrechtlich geschützt. Du
          erhältst für die Dauer des Vertrags ein einfaches, nicht
          übertragbares Recht, die Inhalte für eigene Zwecke zu nutzen,
          einschließlich der gewerblichen Nutzung in eigenen Projekten und
          Kundenprojekten.
        </p>
        <p>
          Nicht erlaubt sind: Weitergabe, Veröffentlichung oder Verkauf der
          Inhalte, das Teilen von Zugangsdaten, Mitschnitte der Videos und die
          Nutzung der Inhalte zum Aufbau eines konkurrierenden Kursangebots.
        </p>
        <p>
          Was du selbst in die Community schreibst oder hochlädst, bleibt
          dein Werk. Du räumst uns daran das Recht ein, es innerhalb der
          Plattform anzuzeigen und zu speichern.
        </p>
      </Absatz>

      <Absatz nr="8" titel="Verfügbarkeit">
        <p>
          Wir bemühen uns um einen durchgehenden Betrieb, schulden aber keine
          bestimmte Verfügbarkeit. Wartungen, Störungen bei Dienstleistern
          und Ereignisse außerhalb unseres Einflussbereichs können zu
          Unterbrechungen führen. Längere Ausfälle, die wir zu vertreten
          haben, rechnen wir anteilig an.
        </p>
      </Absatz>

      <Absatz nr="9" titel="Haftung">
        <p>
          Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei
          Verletzung von Leben, Körper oder Gesundheit, bei arglistig
          verschwiegenen Mängeln und im Rahmen einer übernommenen Garantie
          sowie nach dem Produkthaftungsgesetz.
        </p>
        <p>
          Bei einfacher Fahrlässigkeit haften wir nur für die Verletzung
          wesentlicher Vertragspflichten, also solcher Pflichten, deren
          Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt
          erst ermöglicht und auf deren Einhaltung du regelmäßig vertrauen
          darfst. In diesem Fall ist die Haftung auf den vertragstypischen,
          vorhersehbaren Schaden begrenzt.
        </p>
        <p>Eine weitergehende Haftung ist ausgeschlossen.</p>
      </Absatz>

      <Absatz nr="10" titel="Änderung dieser Bedingungen">
        <p>
          Wir dürfen diese Bedingungen ändern, wenn dafür ein sachlicher
          Grund vorliegt, etwa geänderte Rechtslage oder neue Funktionen. Wir
          kündigen Änderungen mindestens sechs Wochen vor ihrem Wirksamwerden
          in Textform an. Widersprichst du nicht bis zum Wirksamwerden, gelten
          sie als angenommen. Auf die Bedeutung des Schweigens weisen wir in
          der Ankündigung hin. Widersprichst du, endet der Vertrag zum
          genannten Zeitpunkt.
        </p>
      </Absatz>

      <Absatz nr="11" titel="Streitbeilegung">
        <p>
          Wir sind weder bereit noch verpflichtet, an einem
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </Absatz>

      <Absatz nr="12" titel="Schlussbestimmungen">
        <p>
          Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Bei
          Verbrauchern gilt diese Rechtswahl nur, soweit dadurch der Schutz
          zwingender Vorschriften des Staates ihres gewöhnlichen Aufenthalts
          nicht entzogen wird.
        </p>
        <p>
          Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts
          oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand
          Kaiserslautern.
        </p>
        <p>
          Sollte eine Bestimmung unwirksam sein, bleibt der übrige Vertrag
          wirksam.
        </p>
      </Absatz>
    </article>
  );
}
