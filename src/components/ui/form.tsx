"use client";

import { useFormStatus } from "react-dom";
import { Loader2, TriangleAlert } from "lucide-react";

export function Field({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      <input
        {...inputProps}
        className="w-full rounded-xl border border-white/10 bg-surface-950/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
      />
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:opacity-90 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="flex items-center gap-2 rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-2.5 text-sm text-accent-400">
      <TriangleAlert className="size-4 shrink-0" />
      {error}
    </p>
  );
}
