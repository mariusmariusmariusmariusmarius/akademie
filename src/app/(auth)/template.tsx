"use client";

import { motion, useReducedMotion } from "motion/react";

/** Federnder Einstieg für die Auth-Karten. */
export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 190, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
