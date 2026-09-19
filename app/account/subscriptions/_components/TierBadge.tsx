"use client";

import { Crown, Sparkles } from "lucide-react";

/**
 * TierBadge — renders a coloured badge for plan tiers (free/standard/pro/enterprise).
 */

const TIER_STYLES: Record<string, { badge: string; badgeText: string }> = {
  free:       { badge: "#f3f4f6", badgeText: "#374151" },
  standard:   { badge: "#ede9fe", badgeText: "#6d28d9" },
  pro:        { badge: "#ffedd5", badgeText: "#ea580c" },
  enterprise: { badge: "#fef3c7", badgeText: "#92400e" },
};

interface TierBadgeProps {
  tier: string;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const s = TIER_STYLES[tier] ?? TIER_STYLES.standard;
  return (
    <span
      className="inline-flex items-center gap-[3px] text-[9px] font-extrabold uppercase tracking-wider px-[7px] py-0.5 rounded-full"
      style={{ backgroundColor: s.badge, color: s.badgeText }}
    >
      {tier === "pro" && <Crown size={8} />}
      {tier === "enterprise" && <Sparkles size={8} />}
      {tier}
    </span>
  );
}
