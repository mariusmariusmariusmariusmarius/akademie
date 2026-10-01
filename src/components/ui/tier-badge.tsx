import { Crown, Lock, Rocket, Sparkle } from "lucide-react";
import { TIER_INFO, type Tier } from "@/lib/tiers";

const STYLES: Record<Tier, { classes: string; Icon: typeof Sparkle }> = {
  free: {
    classes: "bg-sky-500/15 text-sky-300 border-sky-400/25",
    Icon: Sparkle,
  },
  starter: {
    classes: "bg-amber-400/15 text-amber-300 border-amber-400/25",
    Icon: Rocket,
  },
  pro: {
    classes: "bg-violet-500/15 text-violet-300 border-violet-400/30",
    Icon: Crown,
  },
};

export function TierBadge({
  tier,
  locked = false,
  className = "",
}: {
  tier: Tier;
  locked?: boolean;
  className?: string;
}) {
  const { classes, Icon } = STYLES[tier];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${classes} ${className}`}
    >
      {locked ? <Lock className="size-3" /> : <Icon className="size-3" />}
      {TIER_INFO[tier].label}
    </span>
  );
}
