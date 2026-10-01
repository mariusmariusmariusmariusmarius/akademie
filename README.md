# Akademie – Code-Einblick

Lernplattform mit Kurs, Community, Account-Stufen und Stripe-Abos, dazu eine
API, über die Mitglieder mit einem persönlichen `mm_`-Schlüssel SEO-Daten
(gegen ein Monatsbudget je Stufe), DNS, Postfächer und Hosting nutzen.

**Live:** https://academy.gefundenwerden.online

> Dieses Repo ist eine Kopie zum Ansehen, ohne Git-Historie und ohne
> Umgebungsvariablen. Die fest eingetragenen Konten in `src/lib/auth/users.ts`
> haben hier Platzhalter; Passwort-Hash und Schlüssel kommen aus der Umgebung.
> Die Kursinhalte selbst (Lektionen, Prompts, Videos) sind nicht enthalten –
> `src/lib/data/curriculum.ts` hat nur ein Beispielmodul.

## Loslegen

```bash
npm install
npm run dev
```

Dann [http://localhost:3000](http://localhost:3000) öffnen.

## Accounts

Es gibt keine offenen Demo-Zugänge mehr. Jeder Account entsteht über die
Registrierung und liegt dauerhaft im verschlüsselten Blob-Store
(`nutzer/<hash der E-Mail>.json`). Neue Accounts starten als **Free** und
durchlaufen einmalig das Onboarding unter `/willkommen`.

Fest im Quelltext stehen nur zwei Accounts (`src/lib/auth/users.ts`), beide
mit scrypt-Hash statt Klartext: der Admin-Zugang und ein Demo-Konto. Wer
sein Passwort nicht kennt, geht über **Passwort vergessen**.

Die Account-Stufe setzt bis zur Stripe-Anbindung der Admin unter
**Einstellungen → Account-Stufe**. Für Mitglieder ist das Umstellen gesperrt.

## Was schon steht

- **Landingpage** mit Curriculum, Community-Teaser, Preisen und Rechtstext-Seiten
- **Auth-Flow**: Login, Registrierung, Passwort vergessen, Onboarding
  (scrypt-Hashes, signierte Cookie-Session)
- **Mitgliederbereich** mit Sidebar-Navigation und Auth-Guard (serverseitig)
- **Kurse**: 7 Module, 31 Lektionen — Freischaltung je Account-Stufe
  (Free / Starter / Pro), serverseitig geprüft
- **Community**: Channels (inkl. Pro-Lounge), Posts, Antworten, Likes,
  Schreibrechte je Stufe
- **Einstellungen** (Profil, Stufe, Platzhalter für Zahlungen & E-Mails)
- **Admin-Bereich** (nur Rolle `admin`): Kennzahlen, Nutzerliste, Inhalte

## Architektur

```
src/
├── app/
│   ├── page.tsx              → Landingpage
│   ├── (auth)/               → Login, Registrieren, Passwort vergessen
│   ├── (app)/                → Geschützter Mitgliederbereich
│   │   ├── dashboard/        → Übersicht & Weiterlernen
│   │   ├── kurse/            → Module → Lektionen (Tier-Gating)
│   │   ├── community/        → Channels & Beiträge
│   │   ├── einstellungen/    → Profil & Account-Stufe
│   │   └── admin/            → Admin-Cockpit (rollenbasiert)
│   └── (legal)/              → Impressum, Datenschutz, AGB (Platzhalter!)
├── components/               → UI-Bausteine (Sidebar, Badges, Formulare …)
└── lib/
    ├── tiers.ts              → Account-Stufen + Freischaltungs-Logik
    ├── auth/                 → Demo-Auth (Session, Userstore, Server Actions)
    └── data/                 → Curriculum & Community (statisch, später DB)
```

## Zahlungen (Stripe)

Bezahlte Stufen laufen als monatliches Abo über Stripe Checkout.

- `src/lib/zahlung/stripe.ts` — Client, Preis-IDs, Abbildung Preis → Stufe
- `src/lib/zahlung/actions.ts` — Checkout starten, Kundenportal öffnen
- `src/app/api/stripe/webhook/route.ts` — **einzige** Stelle, an der eine
  bezahlte Stufe entsteht. Signatur wird über den rohen Rumpf geprüft.

Nötige Umgebungsvariablen:

| Variable | Woher |
| -------- | ----- |
| `STRIPE_SECRET_KEY` | Stripe → Entwickler → API-Schlüssel (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → Endpunkt `/api/stripe/webhook` (`whsec_…`) |
| `STRIPE_PREIS_STARTER` | Preis-ID des Starter-Abos (`price_…`) |
| `STRIPE_PREIS_PRO` | Preis-ID des Pro-Abos (`price_…`) |
| `STRIPE_PORTAL_KONFIG` | Konfiguration des Kundenportals (`bpc_…`). Im selben Konto liegen fremde Produkte, deshalb ausdrücklich gesetzt. |

Fehlt der Schlüssel, verschwinden die Buchen-Knöpfe und die Plattform läuft
ohne Zahlungen weiter. Solange kein Checkout live ist, vergibt der Admin die
Stufe von Hand im Adminbereich.

## Später anbinden (bewusst noch nicht drin)

Die Austauschstellen sind im Code markiert und so geschnitten, dass der
Tausch lokal bleibt:

| Dienst     | Ersetzt                                        | Andockpunkt                          |
| ---------- | ---------------------------------------------- | ------------------------------------ |
| **Neon**   | Statisches Curriculum, Community-Mockdaten     | `src/lib/data/*`                     |
| **Auth.js / Lucia** | Eigene signierte Cookie-Session       | `src/lib/auth/session.ts`            |

## Wichtig vor dem Livegang

- ⚠️ AGB und Widerrufsbelehrung unter `(legal)/agb` sind **Platzhalter**.
  Vor der ersten echten Abbuchung mit echtem Text füllen.
- ⚠️ Stripe als Auftragsverarbeiter in Datenschutzerklärung und AVV nachtragen
- ✅ Passwörter als scrypt-Hash, Session signiert
- ✅ Demo-Zugänge von der Login-Seite entfernt
