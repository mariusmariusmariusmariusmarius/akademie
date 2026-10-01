"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Newspaper,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import type { Session } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { Avatar } from "@/components/ui/avatar";
import { TierBadge } from "@/components/ui/tier-badge";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kurse", label: "Kurse", icon: GraduationCap },
  { href: "/community", label: "Community", icon: MessagesSquare },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
] as const;

export function AppSidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Merken, wo der Nutzer in den Kursen zuletzt war — der Kurse-Link
  // führt von außerhalb genau dorthin zurück statt zur Übersicht.
  useEffect(() => {
    if (pathname.startsWith("/kurse")) {
      try {
        localStorage.setItem("mc-kurse-position", pathname);
      } catch {}
    }
  }, [pathname]);

  const kurseKlick = (e: React.MouseEvent) => {
    setOpen(false);
    if (pathname.startsWith("/kurse")) return; // innerhalb der Kurse: normal zur Übersicht
    try {
      const gemerkt = localStorage.getItem("mc-kurse-position");
      if (gemerkt && gemerkt !== "/kurse") {
        e.preventDefault();
        router.push(gemerkt);
      }
    } catch {}
  };

  const items = [
    ...NAV,
    ...(session.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: ShieldCheck } as const]
      : []),
  ];

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={item.href === "/kurse" ? kurseKlick : () => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-gradient-to-r from-brand-500/20 to-accent-500/10 text-white ring-1 ring-brand-500/30"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className={`size-4.5 ${active ? "text-brand-300" : ""}`} />
            {item.label}
          </Link>
        );
      })}
      <a
        href="https://blog.gefundenwerden.online"
        target="_blank"
        rel="noopener"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        <Newspaper className="size-4.5" />
        Blog
        <ArrowUpRight className="ml-auto size-3.5 text-zinc-600" />
      </a>
    </nav>
  );

  // Nur für Free-Accounts: Pro ist noch nicht buchbar, Starter schon.
  const upsell = session.tier === "free" && (
    <Link
      href="/buchen?stufe=starter"
      onClick={() => setOpen(false)}
      className="group block rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-600/20 to-accent-500/10 p-4 transition hover:border-brand-500/50"
    >
      <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white">
        <Sparkles className="size-4 text-gold-400" />
        Alle Module freischalten
      </div>
      <p className="text-xs leading-relaxed text-zinc-400">
        Starter: fünf Module, 19 Lektionen, monatlich kündbar.
      </p>
    </Link>
  );

  /** Account, Stufe und Logout — sitzen unten in der Leiste statt im Header */
  const account = (
    <div className="space-y-3 border-t border-white/5 pt-4">
      <Link
        href="/einstellungen"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5"
      >
        <Avatar name={session.name} gradient={session.avatarColor} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">
            {session.name}
          </span>
          <span className="block truncate text-xs text-zinc-500">
            {session.email}
          </span>
        </span>
      </Link>

      <div className="flex items-center justify-between gap-2 px-2">
        <TierBadge tier={session.tier} />
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-3.5" />
            Ausloggen
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 grid size-10 place-items-center rounded-xl glass text-white xl:hidden"
        aria-label="Menü öffnen"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-8 border-r border-white/5 bg-surface-900/95 p-6 backdrop-blur transition-transform xl:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Logo href="/dashboard" />
          <button
            onClick={() => setOpen(false)}
            className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:text-white xl:hidden"
            aria-label="Menü schließen"
          >
            <X className="size-5" />
          </button>
        </div>
        {nav}
        {upsell}
        {account}
      </aside>
    </>
  );
}
