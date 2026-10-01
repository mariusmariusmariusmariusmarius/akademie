import type { SVGProps } from "react";

/**
 * Die eigenen Kanäle von gefundenwerden.online als Zeichen.
 *
 * Von Hand nachgezeichnet, weil lucide seit Version 1 keine Markenlogos mehr
 * führt. Dieselben Pfade wie auf der Website in `app/marius/Kanaele.tsx`.
 */

const zeichen = (p: SVGProps<SVGSVGElement>) => ({
  width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true, ...p,
});

const KANAELE = [
  {
    name: "Instagram",
    adresse: "https://www.instagram.com/gefundenwerden.online/",
    Zeichen: (p: SVGProps<SVGSVGElement>) => (
      <svg {...zeichen(p)} fill="none" stroke="currentColor" strokeWidth="1.9">
        <rect x="3" y="3" width="18" height="18" rx="5.4" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    adresse: "https://www.youtube.com/@gefundenwerden.online",
    Zeichen: (p: SVGProps<SVGSVGElement>) => (
      <svg {...zeichen(p)} fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    adresse: "https://www.facebook.com/301553546380186",
    Zeichen: (p: SVGProps<SVGSVGElement>) => (
      <svg {...zeichen(p)} fill="currentColor">
        <path d="M13.7 21.9V13h3l.45-3.5h-3.45V7.27c0-1 .28-1.7 1.72-1.7h1.85V2.45a24.6 24.6 0 0 0-2.7-.14c-2.67 0-4.5 1.63-4.5 4.63V9.5H7.05V13h3.02v8.9h3.63Z" />
      </svg>
    ),
  },
  {
    name: "X",
    adresse: "https://x.com/marius_wealth",
    Zeichen: (p: SVGProps<SVGSVGElement>) => (
      <svg {...zeichen(p)} fill="currentColor">
        <path d="M17.45 2.6h3.05l-6.66 7.62L21.7 21.4h-6.14l-4.8-6.29-5.5 6.29H2.2l7.13-8.15L2.05 2.6h6.3l4.34 5.74 5-5.74Zm-1.07 16.96h1.69L7.72 4.34H5.9l10.48 15.22Z" />
      </svg>
    ),
  },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {KANAELE.map(({ name, adresse, Zeichen }) => (
        <li key={name}>
          <a
            href={adresse}
            target="_blank"
            rel="noopener"
            aria-label={name}
            title={name}
            /* 44px, damit der Daumen trifft. */
            className="grid size-11 place-items-center rounded-xl text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <Zeichen />
          </a>
        </li>
      ))}
    </ul>
  );
}
