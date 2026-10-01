import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Logo } from "@/components/logo";
import { OnboardingFlow } from "@/components/app/onboarding-flow";

export const metadata = { title: "Willkommen" };

export default async function WillkommenPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Wer schon durch ist, hat hier nichts mehr verloren.
  if (session.onboarding) redirect("/dashboard");

  return (
    <div className="bg-noise relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[130px]" />
        <div className="absolute bottom-0 right-[10%] h-64 w-64 rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="mb-8 flex flex-col items-center gap-6">
          <Logo />
        </div>
        <div className="rounded-3xl glass p-8 shadow-2xl shadow-black/40">
          <OnboardingFlow vorname={session.name.split(" ")[0]} />
        </div>
      </div>
    </div>
  );
}
