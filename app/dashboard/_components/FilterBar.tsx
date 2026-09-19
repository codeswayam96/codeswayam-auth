"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { BillingCycle } from "./types";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  productCountByCategory: Record<string, number>;
  totalProductCount: number;
}

/**
 * FilterBar — search input + category pills for the product catalog.
 */
export function FilterBar({
  searchTerm, onSearchChange,
  categories, activeCategory, onCategoryChange,
  productCountByCategory, totalProductCount,
}: FilterBarProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
            <Search size={18} className="text-violet-700" />
          </div>
          <div>
            <h2 className="m-0 text-xl font-black text-gray-900">Individual Products</h2>
            <p className="m-0 text-[13px] text-gray-500">Subscribe only to what you need, one tool at a time.</p>
          </div>
        </div>
        <div className="relative w-full sm:w-60 shrink-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 sm:h-9 text-sm rounded-xl border-gray-200 focus-visible:ring-violet-400 focus-visible:ring-offset-0 bg-white"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {[null, ...categories].map((cat) => {
            const active = activeCategory === cat;
            const label  = cat === null
              ? `All (${totalProductCount})`
              : `${cat} (${productCountByCategory[cat] ?? 0})`;
            return (
              <button
                key={cat ?? "__all__"}
                onClick={() => onCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer transition-all duration-150 capitalize ${active
                  ? "border-violet-700 bg-violet-700 text-white"
                  : "border-gray-200 bg-transparent text-gray-500 hover:border-violet-300 hover:text-violet-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
