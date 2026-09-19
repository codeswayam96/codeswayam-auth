import React from "react";
import type { Invoice } from "@/lib/api";

interface InvoicesFilterTabsProps {
  invoices: Invoice[];
  filter: string;
  onFilterChange: (filter: string) => void;
}

export function InvoicesFilterTabs({
  invoices,
  filter,
  onFilterChange,
}: InvoicesFilterTabsProps) {
  if (invoices.length === 0) return null;

  return (
    <div className="flex gap-1 border-b border-gray-200 overflow-x-auto no-scrollbar">
      {["all", "paid", "pending", "failed", "refunded"].map((f) => {
        const count =
          f === "all"
            ? invoices.length
            : invoices.filter((i) => i.status === f).length;
        if (f !== "all" && count === 0) return null;
        return (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`-mb-px px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap capitalize ${
              filter === f
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {f === "all" ? "All" : f}
            <span
              className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === f
                  ? "bg-violet-100 text-violet-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
