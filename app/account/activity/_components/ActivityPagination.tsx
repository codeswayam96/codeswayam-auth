"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ActivityPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalEvents: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ActivityPagination({
  currentPage,
  totalPages,
  pageSize,
  totalEvents,
  onPageChange,
  onPageSizeChange,
}: ActivityPaginationProps) {
  if (totalEvents === 0) return null;

  const start = Math.min((currentPage - 1) * pageSize + 1, totalEvents);
  const end = Math.min(currentPage * pageSize, totalEvents);

  return (
    <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <p className="text-xs text-gray-400">
          Showing {start}–{end} of {totalEvents} events
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Page Size:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
            }}
            className="h-8 text-xs border border-gray-200 rounded-lg px-2 bg-white text-gray-600 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="h-8 text-xs px-3"
        >
          Previous
        </Button>
        <span className="text-xs font-semibold px-2 text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="h-8 text-xs px-3"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
