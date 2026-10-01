import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AppSidebar } from "@/components/app/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  // Wer frisch registriert ist, wird erst durchs Onboarding geführt.
  if (!session.onboarding) redirect("/willkommen");

  return (
    <div className="flex min-h-screen">
      <AppSidebar session={session} />
      <div className="flex min-w-0 flex-1 flex-col xl:pl-72">
        {/* Kein Header mehr — Account und Logout sitzen unten in der Seitenleiste,
            damit oben die volle Höhe fürs Video bleibt. */}
        {/* pt-20 unterhalb von xl: dort schwebt der Menü-Knopf über der Seite und
            läge sonst auf der ersten Textzeile */}
        <main className="bg-noise flex-1 px-5 pb-8 pt-20 md:px-10 xl:pt-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
