import Image from "next/image";
import Link from "next/link";

/**
 * Marke der Academy: die weiße Wortmarke von gefundenwerden.online,
 * darunter der Zusatz „Academy". Ohne Bildmarke — der Schriftzug steht allein.
 */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group block leading-none">
      <Image
        src="/brand.png"
        alt="gefundenwerden.online"
        width={1000}
        height={307}
        priority
        className="h-10 w-auto transition-opacity group-hover:opacity-80"
      />
      <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.26em] text-brand-400">
        Academy
      </span>
    </Link>
  );
}
