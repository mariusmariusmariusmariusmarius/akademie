"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";

/**
 * Wiederverwendbare Motion-Bausteine (Framer Motion / motion.dev).
 * Als Client-Inseln nutzbar aus Server-Komponenten heraus.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Blendet Inhalt beim Scrollen ins Bild ein (einmalig). Negatives y = von oben. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Container, der seine StaggerItem-Kinder nacheinander einblendet. */
export function Stagger({
  children,
  className,
  delay = 0,
  stagger = 0.09,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 26,
  hoverLift = false,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  hoverLift?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
      }}
      whileHover={hoverLift ? { y: -6 } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Zählt eine Zahl hoch, sobald sie sichtbar wird. */
export function CountUp({
  to,
  suffix = "",
  className,
}: {
  to: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el) return;
    if (reduced) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (value) => {
        el.textContent = `${Math.round(value)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix, reduced]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}

/** Langsam driftender Deko-Blob für Hintergründe. */
export function DriftBlob({
  className,
  duration = 18,
  dx = 50,
  dy = 34,
}: {
  className?: string;
  duration?: number;
  dx?: number;
  dy?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div aria-hidden className={className} />;
  return (
    <motion.div
      aria-hidden
      animate={{ x: [0, dx, -dx / 2, 0], y: [0, -dy, dy / 2, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    />
  );
}

/** Buttons & Links mit fühlbarem Feedback. */
export function Pressable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
