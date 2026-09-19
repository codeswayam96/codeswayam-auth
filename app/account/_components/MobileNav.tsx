import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

interface MobileNavProps {
  pathname: string;
}

export function MobileNav({ pathname }: MobileNavProps) {
  return (
    <div className="md:hidden sticky top-16 z-30 bg-background/80 backdrop-blur border-b overflow-x-auto no-scrollbar">
      <div className="flex px-4 py-2 gap-1 min-w-max">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
