"use client";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );
  const changePageSize = (s: number) => { setPageSize(s); setPage(1); };
  return { page: safePage, setPage, pageSize, changePageSize, totalPages, paginated, total: items.length };
}

export function Pagination({
  page, totalPages, total, pageSize,
  onPageChange, onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  label = "items",
}: {
  page: number; totalPages: number; total: number; pageSize: number;
  onPageChange: (p: number) => void; onPageSizeChange: (s: number) => void;
  pageSizeOptions?: number[]; label?: string;
}) {
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50/50 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <span className="text-xs">Rows:</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="h-7 rounded border border-gray-200 bg-white px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
        >
          {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs hidden sm:inline">
          {total === 0 ? "No results" : `${from}–${to} of ${total} ${label}`}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)} disabled={page === 1}
          className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronLeft size={11} /><ChevronLeft size={11} className="-ml-2" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronLeft size={13} />
        </button>
        <span className="text-xs px-2 min-w-[52px] text-center">{page} / {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronRight size={13} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)} disabled={page === totalPages}
          className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronRight size={11} /><ChevronRight size={11} className="-ml-2" />
        </button>
      </div>
    </div>
  );
}
