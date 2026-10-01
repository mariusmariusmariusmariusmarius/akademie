import {
  Archivo,
  Arvo,
  Bricolage_Grotesque,
  DM_Sans,
  Fraunces,
  Instrument_Serif,
  Inter,
  Josefin_Sans,
  Lato,
  Libre_Baskerville,
  Lora,
  Manrope,
  Montserrat,
  Neuton,
  Newsreader,
  Nunito,
  Open_Sans,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Poppins,
  Raleway,
  Roboto,
  Rubik,
  Source_Sans_3,
  Space_Grotesk,
  Ubuntu,
  Work_Sans,
} from "next/font/google";

// Alle Schriften liefert Next selbst aus — es lädt nichts von Google nach.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["700"] });
const archivo = Archivo({ subsets: ["latin"], weight: ["700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: ["400"] });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["600"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["700"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["600"] });
const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["600"] });
const raleway = Raleway({ subsets: ["latin"], weight: ["700"] });
const rubik = Rubik({ subsets: ["latin"], weight: ["700"] });
const arvo = Arvo({ subsets: ["latin"], weight: ["700"] });

const inter = Inter({ subsets: ["latin"], weight: ["400"] });
const manrope = Manrope({ subsets: ["latin"], weight: ["400"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400"] });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400"] });
const lato = Lato({ subsets: ["latin"], weight: ["400"] });
const nunito = Nunito({ subsets: ["latin"], weight: ["400"] });
const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["400"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"], weight: ["400"] });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["400"] });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400"] });
const lora = Lora({ subsets: ["latin"], weight: ["400"] });
const baskerville = Libre_Baskerville({ subsets: ["latin"], weight: ["400"] });
const neuton = Neuton({ subsets: ["latin"], weight: ["400"] });

const PROBE_GROSS = "Quick Brown Fox";
const PROBE_TEXT =
  "The quick brown fox jumps over the lazy dog. Größere Öfen mit Übermaß.";

type Schrift = {
  name: string;
  klasse: string;
  art: string;
  wirkung: string;
  zeilenhoehe: string;
  laufweite: string;
  kombi: string;
};

const UEBERSCHRIFTEN: Schrift[] = [
  {
    name: "Bricolage Grotesque",
    klasse: bricolage.className,
    art: "Display",
    wirkung: "Kräftig, leicht eigenwillig. Die Schrift, die man gerade überall auf neuen Seiten sieht.",
    zeilenhoehe: "1,05",
    laufweite: "−2 %",
    kombi: "Inter",
  },
  {
    name: "Archivo",
    klasse: archivo.className,
    art: "Sans, breit",
    wirkung: "Breit und plakativ, wie Beschriftung auf dem Firmenwagen. Bau, Dach, Garten- und Landschaftsbau.",
    zeilenhoehe: "1,05",
    laufweite: "−2 %",
    kombi: "Inter, Manrope",
  },
  {
    name: "Space Grotesk",
    klasse: spaceGrotesk.className,
    art: "Sans, technisch",
    wirkung: "Modern mit ungewöhnlichen Buchstabenformen. Elektro, Photovoltaik, Metallbau, IT.",
    zeilenhoehe: "1,1",
    laufweite: "−1 %",
    kombi: "Inter",
  },
  {
    name: "Montserrat",
    klasse: montserrat.className,
    art: "Sans, geometrisch",
    wirkung: "Der Klassiker unter den Überschriften-Schriften. Sicher, sauber — aber man sieht sie oft.",
    zeilenhoehe: "1,1",
    laufweite: "−1 %",
    kombi: "Open Sans, Lato",
  },
  {
    name: "Poppins",
    klasse: poppins.className,
    art: "Sans, rund",
    wirkung: "Runde, freundliche Formen. Wirkt zugänglich statt streng. Pflege, Kosmetik, Kita, Physio.",
    zeilenhoehe: "1,1",
    laufweite: "−1 %",
    kombi: "Inter, Work Sans",
  },
  {
    name: "Rubik",
    klasse: rubik.className,
    art: "Sans, weiche Ecken",
    wirkung: "Leicht abgerundete Ecken — kräftig, aber nicht hart. Guter Mittelweg für fast jede Branche.",
    zeilenhoehe: "1,1",
    laufweite: "−1 %",
    kombi: "Inter, Nunito",
  },
  {
    name: "Raleway",
    klasse: raleway.className,
    art: "Sans, elegant",
    wirkung: "Schlank und leicht. Wirkt hochwertig, braucht aber genug Größe, sonst wird es dünn.",
    zeilenhoehe: "1,1",
    laufweite: "0",
    kombi: "Lato, Open Sans",
  },
  {
    name: "Josefin Sans",
    klasse: josefin.className,
    art: "Sans, schlank",
    wirkung: "Hohe, schmale Formen im Stil der 1920er. Auffällig — sparsam einsetzen.",
    zeilenhoehe: "1,15",
    laufweite: "+2 %",
    kombi: "Lato, Roboto",
  },
  {
    name: "Instrument Serif",
    klasse: instrument.className,
    art: "Serif, elegant",
    wirkung: "Schmal und elegant. Hebt sofort das Preisniveau. Innenausbau, Küchen, Bäder, Schreinerei.",
    zeilenhoehe: "1,05",
    laufweite: "0",
    kombi: "Inter, Plus Jakarta Sans",
  },
  {
    name: "Playfair Display",
    klasse: playfair.className,
    art: "Serif, klassisch",
    wirkung: "Starke Kontraste zwischen dicken und dünnen Strichen. Edel, festlich. Gastro, Hochzeit, Schmuck.",
    zeilenhoehe: "1,1",
    laufweite: "0",
    kombi: "Source Sans, Lato",
  },
  {
    name: "Fraunces",
    klasse: fraunces.className,
    art: "Serif, charaktervoll",
    wirkung: "Warm und handgemacht. Betriebe mit Tradition: Bäckerei, Tischlerei, Restaurierung.",
    zeilenhoehe: "1,05",
    laufweite: "−1 %",
    kombi: "Manrope",
  },
  {
    name: "Arvo",
    klasse: arvo.className,
    art: "Slab-Serif",
    wirkung: "Dicke, eckige Serifen. Robust und bodenständig — passt zu Werkstatt und Baustelle.",
    zeilenhoehe: "1,1",
    laufweite: "0",
    kombi: "Open Sans, Roboto",
  },
];

const FLIESSTEXT: Schrift[] = [
  {
    name: "Inter",
    klasse: inter.className,
    art: "Sans, neutral",
    wirkung: "Der Standard. Fällt nicht auf, auf jedem Bildschirm gut lesbar. Wenn du unsicher bist: die hier.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "passt unter fast jede Überschrift",
  },
  {
    name: "Manrope",
    klasse: manrope.className,
    art: "Sans, freundlich",
    wirkung: "Runder und wärmer als Inter. Nimmt strengen Überschriften die Härte.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Fraunces, Archivo",
  },
  {
    name: "Plus Jakarta Sans",
    klasse: jakarta.className,
    art: "Sans, modern",
    wirkung: "Etwas eigener als Inter, ohne anstrengend zu sein. Für Seiten, die frisch wirken sollen.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Instrument Serif, Bricolage",
  },
  {
    name: "DM Sans",
    klasse: dmSans.className,
    art: "Sans, geometrisch",
    wirkung: "Klar und geometrisch, sehr ruhig im Textblock. Guter Allrounder.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Space Grotesk, Playfair",
  },
  {
    name: "Roboto",
    klasse: roboto.className,
    art: "Sans, Standard",
    wirkung: "Die Android-Schrift. Extrem verbreitet, nüchtern, funktioniert immer — hat wenig Eigenes.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Montserrat, Arvo",
  },
  {
    name: "Open Sans",
    klasse: openSans.className,
    art: "Sans, offen",
    wirkung: "Weite Buchstabenformen, sehr gut lesbar auch in klein. Der sichere Griff für Fließtext.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Montserrat, Playfair",
  },
  {
    name: "Lato",
    klasse: lato.className,
    art: "Sans, warm",
    wirkung: "Halbrunde Formen, wirkt freundlich und seriös zugleich. Beliebt bei Dienstleistern.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Raleway, Playfair",
  },
  {
    name: "Nunito",
    klasse: nunito.className,
    art: "Sans, weich",
    wirkung: "Abgerundete Enden, sehr weich. Gut bei Kindern, Tieren, Gesundheit — kann schnell verspielt wirken.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Rubik, Poppins",
  },
  {
    name: "Work Sans",
    klasse: workSans.className,
    art: "Sans, sachlich",
    wirkung: "Für Bildschirme gemacht, ruhig im Absatz. Unauffällige Alternative zu Inter.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Poppins, Space Grotesk",
  },
  {
    name: "Source Sans 3",
    klasse: sourceSans.className,
    art: "Sans, nüchtern",
    wirkung: "Adobes offene Schrift, früher Source Sans Pro. Sachlich, gut für viel Text.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Playfair, Montserrat",
  },
  {
    name: "Ubuntu",
    klasse: ubuntu.className,
    art: "Sans, eigen",
    wirkung: "Eigenwillige Rundungen mit technischem Einschlag. Erkennbar, aber nicht für jede Branche.",
    zeilenhoehe: "1,6",
    laufweite: "0",
    kombi: "Arvo, Space Grotesk",
  },
  {
    name: "Newsreader",
    klasse: newsreader.className,
    art: "Serif, Lesetext",
    wirkung: "Serifen im Fließtext. Ruhig und seriös, angenehm bei längeren Texten.",
    zeilenhoehe: "1,7",
    laufweite: "0",
    kombi: "Archivo, Space Grotesk",
  },
  {
    name: "Lora",
    klasse: lora.className,
    art: "Serif, weich",
    wirkung: "Serifen mit leicht geschwungenen Formen. Wirkt persönlich, gut für Über-uns-Texte.",
    zeilenhoehe: "1,7",
    laufweite: "0",
    kombi: "Montserrat, Raleway",
  },
  {
    name: "Libre Baskerville",
    klasse: baskerville.className,
    art: "Serif, klassisch",
    wirkung: "Buchtypografie für den Bildschirm. Seriös und ruhig — braucht großzügige Zeilenhöhe.",
    zeilenhoehe: "1,75",
    laufweite: "0",
    kombi: "Montserrat, Raleway",
  },
  {
    name: "Neuton",
    klasse: neuton.className,
    art: "Serif, schmal",
    wirkung: "Schmale Serifenschrift, spart Platz. Gut, wenn viel Text auf wenig Raum muss.",
    zeilenhoehe: "1,7",
    laufweite: "0",
    kombi: "Josefin Sans, Rubik",
  },
];

function Karte({ s, gross }: { s: Schrift; gross?: boolean }) {
  return (
    <li className="flex w-72 shrink-0 snap-start flex-col rounded-2xl border border-white/8 bg-surface-950/40 p-5">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-semibold text-white">{s.name}</span>
        <span className="text-[0.65rem] uppercase tracking-widest text-zinc-500">{s.art}</span>
      </div>

      {/* Die Probe steht wirklich in der Schrift, um die es geht */}
      <p
        className={`${s.klasse} mb-3 text-zinc-100 ${
          gross ? "text-2xl leading-none" : "text-sm leading-relaxed"
        }`}
        style={gross ? { letterSpacing: "-0.02em" } : undefined}
      >
        {gross ? PROBE_GROSS : PROBE_TEXT}
      </p>

      <p className="mb-4 grow text-xs leading-relaxed text-zinc-400">{s.wirkung}</p>

      <dl className="space-y-1 border-t border-white/8 pt-3 text-[0.7rem] text-zinc-500">
        <div className="flex gap-x-4">
          <div className="flex gap-1.5">
            <dt>Zeilenhöhe</dt>
            <dd className="font-medium text-zinc-300">{s.zeilenhoehe}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Laufweite</dt>
            <dd className="font-medium text-zinc-300">{s.laufweite}</dd>
          </div>
        </div>
        <div className="flex gap-1.5">
          <dt>Kombi mit</dt>
          <dd className="font-medium text-zinc-300">{s.kombi}</dd>
        </div>
      </dl>
    </li>
  );
}

function Reihe({ titel, schriften, gross }: { titel: string; schriften: Schrift[]; gross?: boolean }) {
  return (
    <>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-300">{titel}</h3>
        <span className="text-xs text-zinc-500">
          {schriften.length} Stück · seitlich wischen →
        </span>
      </div>
      {/* seitlich scrollen statt untereinander — spart Platz auf der Seite */}
      <ul className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4">
        {schriften.map((s) => (
          <Karte key={s.name} s={s} gross={gross} />
        ))}
      </ul>
    </>
  );
}

export function FontSchau() {
  return (
    <div className="rounded-3xl border border-white/8 bg-surface-900/70 p-8">
      <h2 className="mb-2 text-lg font-semibold text-white">Schriftarten im Überblick</h2>
      <p className="mb-6 max-w-[60ch] leading-relaxed text-zinc-300">
        Alle Schriften hier sind bei Google Fonts kostenlos und dürfen auch gewerblich
        benutzt werden. Nimm <strong className="text-white">eine</strong> für Überschriften
        und <strong className="text-white">eine</strong> für Fließtext — mehr nicht. Die
        Werte unter jeder Karte kannst du Claude direkt so ansagen.
      </p>

      <Reihe titel="Für Überschriften" schriften={UEBERSCHRIFTEN} gross />
      <div className="mt-6">
        <Reihe titel="Für Fließtext" schriften={FLIESSTEXT} />
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-surface-950/40 p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">
          Zeilenhöhe und Laufweite — die zwei Stellschrauben
        </h3>
        <ul className="space-y-2 text-sm leading-relaxed text-zinc-400">
          <li>
            <strong className="text-zinc-200">Zeilenhöhe</strong> ist der Abstand zwischen den
            Zeilen. Faustregel: je größer die Schrift, desto enger. Große Überschriften 1,0
            bis 1,1 — Fließtext 1,5 bis 1,7. Fließtext mit Zeilenhöhe 1,2 ist der häufigste
            Anfängerfehler, das wirkt sofort gedrängt.
          </li>
          <li>
            <strong className="text-zinc-200">Laufweite</strong> ist der Abstand zwischen den
            Buchstaben. Große Überschriften vertragen minus 1 bis 2 Prozent, dann wirken sie
            kompakter. Fließtext bleibt bei null. Nur bei kleinen Großbuchstaben-Zeilen geht
            man ins Plus, etwa 10 Prozent, sonst kleben die Buchstaben.
          </li>
        </ul>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        Vier Schriften aus gängigen Bestenlisten fehlen hier bewusst: Ranade gibt es nur bei
        Fontshare, Objekt Sans, Soria und Sreda muss man kaufen. Für den Anfang brauchst du
        sie nicht.
      </p>
    </div>
  );
}
