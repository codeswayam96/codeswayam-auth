import React from "react";
import { AlertCircle } from "lucide-react";

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
      <AlertCircle size={16} className="shrink-0" />
      {message}
    </div>
  );
}
