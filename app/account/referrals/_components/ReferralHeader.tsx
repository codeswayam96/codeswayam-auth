import React from "react";
import { Gift } from "lucide-react";

export function ReferralHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-violet-100/60 to-white px-5 sm:px-7 py-5 sm:py-6 text-center sm:text-left">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border-[28px] border-violet-200/40" />
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-violet-600">
            Referral Program
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Earn Points
          </h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-gray-500">
            Share your code, invite friends, and collect bonus points.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-violet-700 shadow-sm">
          <Gift size={14} /> Reward system active
        </div>
      </div>
    </div>
  );
}
