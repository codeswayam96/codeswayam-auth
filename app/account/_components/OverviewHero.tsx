import React from "react";

interface OverviewHeroProps {
  displayName: string;
  status?: string;
}

export function OverviewHero({ displayName, status }: OverviewHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-violet-100/60 to-white px-8 py-7">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-[28px] border-violet-200/50" />
      <div className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-full border-[12px] border-violet-300/30" />

      <div className="flex flex-wrap items-center gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-300">
          <span className="text-2xl font-extrabold text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-violet-600">My Account</p>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Welcome back, <span className="text-violet-600">{displayName}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            All your subscriptions and settings in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          {status || "Active"}
        </div>
      </div>
    </div>
  );
}
