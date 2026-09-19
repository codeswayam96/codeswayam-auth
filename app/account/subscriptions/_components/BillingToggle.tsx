"use client";

import type { BillingCycle } from "@/types";

/**
 * BillingToggle — monthly / yearly cycle selector with savings badge.
 */

interface BillingToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export function BillingToggle({ cycle, onChange }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {(["monthly", "yearly"] as const).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-150
            ${cycle === opt
              ? "border-violet-700 bg-violet-700 text-white"
              : "border-gray-200 bg-transparent text-gray-500"
            }`}
        >
          {opt === "monthly" ? "Monthly" : "Yearly"}
          {opt === "yearly" && (
            <span
              className={`text-[9px] font-extrabold px-1.5 py-px rounded-full border
                ${cycle === "yearly"
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-green-100 text-green-700 border-green-200"
                }`}
            >
              Save 17%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
