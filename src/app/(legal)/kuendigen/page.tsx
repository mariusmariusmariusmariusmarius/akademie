import { KuendigungsFormular } from "./kuendigungs-formular";

export const metadata = {
  title: "Verträge kündigen",
  alternates: { canonical: "/kuendigen" },
};

export default function KuendigenPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Verträge hier kündigen
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Hier kündigst du deine Mitgliedschaft in der gefundenwerden.online
          Academy. Ohne Login, ohne Anruf, ohne Frist. Die Kündigung wirkt zum
          Ende des laufenden Abrechnungszeitraums, bis dahin bleibt dein
          Zugang offen.
        </p>
      </div>

      <KuendigungsFormular />

      <p className="text-xs leading-relaxed text-zinc-600">
        Du bekommst sofort eine Bestätigung per E-Mail, mit Eingangszeitpunkt
        und dem Datum, zu dem der Vertrag endet. Speichere sie dir. Eine
        Kündigung per Brief oder formloser E-Mail an
        info@gefundenwerden.online geht selbstverständlich genauso.
      </p>
    </article>
  );
}
