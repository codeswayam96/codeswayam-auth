"use client";

/**
 * StatusPill — renders a coloured badge for subscription status.
 * Handles: active | past_due | canceled | pending_cancellation | expired
 */

const STATUS_CONFIG: Record<string, { classes: string; label: string }> = {
  active:               { classes: "bg-green-50 text-green-700 border-green-200",   label: "Active" },
  past_due:             { classes: "bg-amber-50 text-amber-700 border-amber-200",   label: "Past Due" },
  canceled:             { classes: "bg-red-50 text-red-600 border-red-200",          label: "Cancelled" },
  pending_cancellation: { classes: "bg-orange-50 text-orange-700 border-orange-200", label: "Cancellation Pending" },
  expired:              { classes: "bg-red-50 text-red-600 border-red-200",          label: "Expired" },
};

interface StatusPillProps {
  status: string;
}

export function StatusPill({ status }: StatusPillProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}
