"use client";

import type { BillingCycle } from "@/types";

/**
 * BillingToggle — monthly / yearly cycle selector with savings badge.
 */

interface BillingToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  disabledCycle?: "monthly" | "yearly";
  disabledReason?: string;
}

export function BillingToggle({ cycle, onChange, disabledCycle, disabledReason }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {(["monthly", "yearly"] as const).map((opt) => {
        const isDisabled = disabledCycle === opt;
        return (
          <button
            key={opt}
            type="button"
            disabled={isDisabled}
            title={isDisabled ? disabledReason : undefined}
            onClick={() => !isDisabled && onChange(opt)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150
              ${isDisabled ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400" : "cursor-pointer"}
              ${!isDisabled && cycle === opt
                ? "border-violet-700 bg-violet-700 text-white"
                : !isDisabled ? "border-gray-200 bg-transparent text-gray-500 hover:border-gray-300" : ""
              }`}
          >
            {opt === "monthly" ? "Monthly" : "Yearly"}
            {opt === "yearly" && (
              <span
                className={`text-[9px] font-extrabold px-1.5 py-px rounded-full border
                  ${cycle === "yearly" && !isDisabled
                    ? "bg-white/20 text-white border-white/30"
                    : "bg-green-100 text-green-700 border-green-200"
                  }`}
              >
                Save 17%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
