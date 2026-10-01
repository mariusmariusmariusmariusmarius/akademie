/**
 * Die Adresse, unter der die Plattform erreichbar ist.
 *
 * Sie steht in Prompts, die Teilnehmer in ihr eigenes Claude kopieren —
 * deshalb genau EINE Stelle. Beim Umzug auf die richtige Domain reicht es,
 * bei Vercel die Umgebungsvariable NEXT_PUBLIC_PLATTFORM_URL zu setzen;
 * alle Prompts ziehen automatisch nach.
 */
export const PLATTFORM_URL = (
  process.env.NEXT_PUBLIC_PLATTFORM_URL ?? "https://mariuscoach.vercel.app"
).replace(/\/$/, "");
