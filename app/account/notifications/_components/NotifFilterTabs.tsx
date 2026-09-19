import React from "react";

interface NotifFilterTabsProps {
  filter: "all" | "unread";
  totalCount: number;
  unreadCount: number;
  onFilterChange: (filter: "all" | "unread") => void;
}

export function NotifFilterTabs({
  filter,
  totalCount,
  unreadCount,
  onFilterChange,
}: NotifFilterTabsProps) {
  if (totalCount === 0) return null;

  return (
    <div className="flex gap-1 border-b border-gray-200">
      {(["all", "unread"] as const).map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={`-mb-px px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors capitalize ${
            filter === f
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {f === "all" ? "All" : "Unread"}
          <span
            className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
              filter === f
                ? "bg-violet-100 text-violet-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {f === "all" ? totalCount : unreadCount}
          </span>
        </button>
      ))}
    </div>
  );
}
