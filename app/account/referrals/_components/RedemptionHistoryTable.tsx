"use client";

import React, { useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ReferralStats } from "@/lib/api";

interface RedemptionHistoryTableProps {
  history?: ReferralStats["history"];
}

const HIST_PAGE_SIZE = 10;

export function RedemptionHistoryTable({ history = [] }: RedemptionHistoryTableProps) {
  const [histPage, setHistPage] = useState(1);
  const histTotalPages = Math.max(1, Math.ceil(history.length / HIST_PAGE_SIZE));
  const pagedHistory = history.slice(
    (histPage - 1) * HIST_PAGE_SIZE,
    histPage * HIST_PAGE_SIZE
  );

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Redemption History</h2>

      {history && history.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm no-scrollbar">
          <table className="w-full text-left text-sm text-gray-600 min-w-[500px] sm:min-w-0">
            <thead className="border-b bg-gray-50 text-[10px] sm:text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Date</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Status</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right font-semibold">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedHistory.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-green-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-semibold text-green-600 text-xs sm:text-sm">
                    +{item.pointsAwarded}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {histTotalPages > 1 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t bg-gray-50/50 text-xs text-gray-500">
              <span>
                {(histPage - 1) * HIST_PAGE_SIZE + 1}–
                {Math.min(histPage * HIST_PAGE_SIZE, history.length)} of {history.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setHistPage((p) => Math.max(1, p - 1))}
                  disabled={histPage === 1}
                  className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <span className="px-2">
                  {histPage} / {histTotalPages}
                </span>
                <button
                  onClick={() => setHistPage((p) => Math.min(histTotalPages, p + 1))}
                  disabled={histPage === histTotalPages}
                  className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-200 shadow-none">
          <CardContent className="flex flex-col items-center p-12 text-center text-gray-500">
            <Users size={32} className="mb-4 text-gray-300" />
            <p className="font-medium">No redemptions yet</p>
            <p className="mt-1 text-sm">When someone uses your referral code, activity appears here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
