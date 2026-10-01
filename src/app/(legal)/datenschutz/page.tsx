export const metadata = { title: "Datenschutz", alternates: { canonical: "/datenschutz" } };

/** Ein Dienstleister in der Auftragsverarbeiter-Tabelle. */
const DIENSTLEISTER: { name: string; sitz: string; zweck: string; ort: string }[] = [
  {
    name: "Vercel Inc.",
    sitz: "340 S Lemon Ave #4133, Walnut, CA 91789, USA",
    zweck:
      "Betrieb dieser Plattform und Speicherung der Kontodaten (Vercel Blob)",
    ort: "Region Frankfurt am Main, Deutschland",
  },
  {
    name: "Cloudflare, Inc.",
    sitz: "101 Townsend St, San Francisco, CA 94107, USA",
    zweck:
      "Verwaltung deiner Domain und ihrer DNS-Einträge, Veröffentlichung deiner Website, TLS-Zertifikate, Abwehr von Angriffen",
    ort: "weltweit verteiltes Netz mit EU-Standorten",
  },
  {
    name: "Migadu Email AG",
    sitz: "Schweiz",
    zweck: "Betrieb der E-Mail-Postfächer, die du auf deiner Domain anlegst",
    ort: "Schweiz und EU",
  },
  {
    name: "DataForSEO",
    sitz: "Europäische Union",
    zweck:
      "Abruf von Markt-, Ranking- und Bewertungsdaten, die du über deinen Schlüssel anforderst",
    ort: "EU",
  },
  {
    name: "Stripe Payments Europe, Limited",
    sitz: "The One Building, 1 Grand Canal Street Lower, Dublin 2, Irland",
    zweck:
      "Abwicklung der Abo-Zahlungen, Rechnungen und Kündigungen. Zahlungsdaten wie Kartennummer oder IBAN gibst du direkt bei Stripe ein; wir sehen sie nie.",
    ort: "Irland, mit Konzerngesellschaften in den USA",
  },
  {
    name: "Resend, Inc.",
    sitz: "USA",
    zweck:
      "Versand der E-Mails dieser Plattform: Willkommen, Passwort zurücksetzen, Bestätigung einer Buchung",
    ort: "EU-Region (Irland)",
  },
];

export default function DatenschutzPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Datenschutzerklärung
      </h1>

      <section className="space-y-5 text-sm leading-relaxed text-zinc-400">
        <p>
          <strong className="text-zinc-200">1. Verantwortlicher</strong>
          <br />
          Marius Müller · Marius Müller Media
          <br />
          Pont-a-Mousson Ring 89, 66849 Landstuhl
          <br />
          E-Mail: info@gefundenwerden.online · Telefon: 0160-3205027
          <br />
          Umsatzsteuer-ID: DE362120118
          <br />
          Einen Datenschutzbeauftragten müssen wir nicht benennen und haben
          keinen bestellt.
        </p>

        <p>
          <strong className="text-zinc-200">2. Welche Daten wir verarbeiten</strong>
          <br />
          <em className="not-italic text-zinc-300">Kontodaten:</em> Name,
          E-Mail-Adresse, Passwort, gebuchte Stufe und dein persönlicher
          API-Schlüssel.
          <br />
          <em className="not-italic text-zinc-300">Nutzungsdaten:</em> welche
          Lektionen du geöffnet hast, wie viele Abfragen du über deinen
          Schlüssel gemacht hast und welche Kosten dabei angefallen sind.
          <br />
          <em className="not-italic text-zinc-300">
            Daten aus den Funktionen, die du benutzt:
          </em>{" "}
          die Domains, die du anschließt, samt zugehöriger DNS-Einträge; die
          Websites, die du veröffentlichst, samt ihrer Dateien; die
          E-Mail-Postfächer, die du anlegst.
          <br />
          <em className="not-italic text-zinc-300">Technische Daten:</em>{" "}
          IP-Adresse, Zeitpunkt, aufgerufene Adresse und Browserangaben, wie sie
          beim Betrieb eines Webservers anfallen.
        </p>

        <p>
          <strong className="text-zinc-200">3. Zwecke und Rechtsgrundlagen</strong>
          <br />
          Wir verarbeiten diese Daten, um dir die Plattform und die damit
          verbundenen Leistungen bereitzustellen — das ist die Erfüllung unseres
          Vertrags mit dir (Art. 6 Abs. 1 lit. b DSGVO). Für den sicheren
          Betrieb, die Abwehr von Missbrauch und die Nachvollziehbarkeit von
          Abfragen stützen wir uns auf unser berechtigtes Interesse (Art. 6
          Abs. 1 lit. f DSGVO).
        </p>

        <p>
          <strong className="text-zinc-200">4. Cookies</strong>
          <br />
          Wir setzen ein einziges Cookie, und zwar für deine Anmeldung. Es
          enthält keine Werbe- oder Analysekennung und wird beim Abmelden
          gelöscht. Wie lange es bleibt, entscheidest du beim Einloggen: mit
          dem Haken „Angemeldet bleiben" läuft es nach 30 Tagen ab, ohne den
          Haken endet es, sobald du den Browser schließt. Weil es für den Betrieb notwendig ist,
          brauchen wir dafür keine Einwilligung — und deshalb siehst du hier
          auch kein Cookie-Banner. Wir setzen keine Analyse- oder
          Tracking-Werkzeuge ein.
        </p>

        <div className="space-y-3">
          <p>
            <strong className="text-zinc-200">5. Eingesetzte Dienstleister</strong>
            <br />
            Diese Unternehmen verarbeiten Daten in unserem Auftrag. Mit allen
            bestehen Verträge zur Auftragsverarbeitung nach Art. 28 DSGVO.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
              <thead className="text-zinc-300">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4 font-medium">Dienstleister</th>
                  <th className="py-2 pr-4 font-medium">Wofür</th>
                  <th className="py-2 font-medium">Verarbeitung</th>
                </tr>
              </thead>
              <tbody>
                {DIENSTLEISTER.map((d) => (
                  <tr key={d.name} className="border-b border-white/5 align-top">
                    <td className="py-2.5 pr-4">
                      <span className="text-zinc-300">{d.name}</span>
                      <br />
                      <span className="text-zinc-500">{d.sitz}</span>
                    </td>
                    <td className="py-2.5 pr-4">{d.zweck}</td>
                    <td className="py-2.5">{d.ort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p>
          <strong className="text-zinc-200">6. Übermittlung in Drittländer</strong>
          <br />
          Vercel, Cloudflare und Resend sind Unternehmen mit Sitz in den USA.
          Die Übermittlung stützt sich auf die Standardvertragsklauseln der
          Europäischen Kommission und, soweit die Anbieter zertifiziert sind,
          auf das EU-US Data Privacy Framework. Für die Schweiz, wo Migadu
          sitzt, liegt ein Angemessenheitsbeschluss der Europäischen Kommission
          vor. Stripe rechnet über seine irische Gesellschaft ab, also
          innerhalb der EU.
        </p>

        <p>
          <strong className="text-zinc-200">7. Wie lange wir speichern</strong>
          <br />
          Kontodaten speichern wir, solange dein Konto besteht, und löschen sie
          spätestens 30 Tage nach dessen Beendigung. Websites, Domains und
          Postfächer bestehen so lange, wie du sie behältst — du kannst sie
          jederzeit selbst abschalten. Technische Zugriffsdaten fallen bei
          unseren Dienstleistern an und werden dort nach kurzer Zeit gelöscht.
          Gesetzliche Aufbewahrungspflichten, etwa aus dem Handels- und
          Steuerrecht, bleiben davon unberührt.
        </p>

        <p>
          <strong className="text-zinc-200">
            8. Wenn du über uns eine Website betreibst
          </strong>
          <br />
          Veröffentlichst du deine Website über uns, verarbeiten wir die Daten
          deiner Besucher nicht für eigene Zwecke, sondern nur in deinem
          Auftrag. Für diese Daten bist du der Verantwortliche und wir dein
          Auftragsverarbeiter. Grundlage dafür ist der Vertrag zur
          Auftragsverarbeitung, den du bei der Buchung erhältst. Was auf deiner
          Website an Daten erhoben wird, entscheidest du — und du brauchst
          dafür eine eigene Datenschutzerklärung.
        </p>

        <p>
          <strong className="text-zinc-200">9. Deine Rechte</strong>
          <br />
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung
          der Verarbeitung, Datenübertragbarkeit und Widerspruch. Eine E-Mail an
          info@gefundenwerden.online genügt.
          <br />
          Außerdem kannst du dich bei einer Aufsichtsbehörde beschweren. Für uns
          zuständig ist: Der Landesbeauftragte für den Datenschutz und die
          Informationsfreiheit Rheinland-Pfalz, Hintere Bleiche 34, 55116 Mainz.
        </p>

        <p className="text-zinc-500">Stand: September 2026</p>
      </section>
    </article>
  );
}
