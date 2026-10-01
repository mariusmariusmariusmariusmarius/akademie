import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Vorschaubild der Academy für WhatsApp, LinkedIn, Slack und Co.
 *
 * Bisher gab es keins, dann zeigen die Dienste irgendeinen Ausschnitt der
 * Seite oder gar nichts. Aufbau wie bei den Schwesterseiten: links die
 * Aussage, rechts ein Anker.
 *
 * Der Anker ist hier eine Videokachel mit Abspielzeichen. Eine Lernplattform
 * verkauft Zeit vor der Kamera, und das erkennt man an einem Standbild
 * schneller als an jeder Überschrift.
 *
 * Wird beim Bauen erzeugt, kostet zur Laufzeit nichts.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "gefundenwerden.online Academy: Websites selbst bauen mit Claude, über 7 Stunden Videomaterial";

const BG = "#14141f";
const FLAECHE = "#1a1a28";
const LINIE = "rgba(255,255,255,0.12)";
const TEXT = "#f4f4f8";
const LEISE = "#a1a1b5";
const BRAND = "#a78bfa";
const GOLD = "#fbbf24";

function alsQuelle(datei: string) {
  const roh = readFileSync(join(process.cwd(), "public", datei));
  return `data:image/jpeg;base64,${roh.toString("base64")}`;
}

export default function Image() {
  const video = alsQuelle("og-video.jpg");
  const foto = alsQuelle("og-marius.jpg");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: BG, fontFamily: "sans-serif", position: "relative" }}>
        {/* Schein in der Markenfarbe, hinter der Videokachel */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: 560,
            width: 860,
            height: 720,
            borderRadius: 999,
            background: "radial-gradient(closest-side, rgba(139,92,246,0.45), rgba(20,20,31,0))",
            display: "flex",
          }}
        />

        {/* Links: die Aussage */}
        <div
          style={{
            width: 640,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 0 64px 68px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: BRAND, display: "flex" }} />
            <div style={{ color: LEISE, fontSize: 21, letterSpacing: 3 }}>ACADEMY</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: TEXT, fontSize: 62, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.8 }}>
              Bau deine Website
            </div>
            <div style={{ color: BRAND, fontSize: 62, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.8 }}>
              selbst. Mit Claude.
            </div>
            <div style={{ color: LEISE, fontSize: 24, lineHeight: 1.45, marginTop: 20, display: "flex", maxWidth: 520 }}>
              Vom leeren Ordner bis zur eigenen Domain. Alle Prompts, alle Zugänge, Schritt für Schritt.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src={foto}
              width={48}
              height={48}
              style={{ width: 48, height: 48, borderRadius: 999, objectFit: "cover", border: `1px solid ${LINIE}` }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: TEXT, fontSize: 21, fontWeight: 700 }}>Marius Müller</div>
              <div style={{ color: LEISE, fontSize: 19 }}>academy.gefundenwerden.online</div>
            </div>
          </div>
        </div>

        {/* Rechts: die Videokachel */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingRight: 60 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              width: "100%",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid ${LINIE}`,
              background: FLAECHE,
            }}
          >
            <img src={video} width={460} height={259} style={{ width: "100%", height: 259, objectFit: "cover" }} />

            {/* Abspielzeichen */}
            <div
              style={{
                position: "absolute",
                left: 211,
                top: 90,
                width: 78,
                height: 78,
                borderRadius: 999,
                background: "rgba(20,20,31,0.72)",
                border: `2px solid ${LINIE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="26" height="30" viewBox="0 0 15 17" fill={TEXT}>
                <path d="M14 8.5 0 17V0z" />
              </svg>
            </div>

            {/* Fußzeile der Kachel */}
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 18px",
                background: "rgba(20,20,31,0.86)",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 999, background: GOLD, display: "flex" }} />
              <div style={{ color: TEXT, fontSize: 19 }}>5 Module · 19 Lektionen</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
