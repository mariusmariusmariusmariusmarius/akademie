import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-noise relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[130px]" />
        <div className="absolute bottom-0 right-[10%] h-64 w-64 rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-6">
          <Logo />
        </div>
        <div className="rounded-3xl glass p-8 shadow-2xl shadow-black/40">
          {children}
        </div>
        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="size-3.5" />
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
