import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const statusCfg: Record<string, { label: string; bg: string; text: string; border: string; Icon: any }> = {
  paid:    { label: "Paid",    bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", Icon: CheckCircle2 },
  pending: { label: "Pending", bg: "#fffbeb", text: "#b45309", border: "#fde68a", Icon: Clock },
  failed:  { label: "Failed",  bg: "#fef2f2", text: "#dc2626", border: "#fecaca", Icon: XCircle },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusCfg[status] || statusCfg.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 8px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        backgroundColor: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <cfg.Icon size={10} />
      {cfg.label}
    </span>
  );
}
