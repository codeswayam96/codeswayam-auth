import React from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, adminItems } from "./nav-items";

interface AccountSidebarProps {
  pathname: string;
  role?: string;
  onLogout: () => void;
}

export function AccountSidebar({ pathname, role, onLogout }: AccountSidebarProps) {
  const isAdmin = role === "admin" || role === "superadmin";

  return (
    <nav className="hidden md:block shrink-0 space-y-1" style={{ width: "220px" }}>
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight">Settings</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-wider">
          Account Control
        </p>
      </div>

      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
              active
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon
              size={18}
              className={cn("transition-transform group-hover:scale-110", active ? "scale-110" : "")}
            />
            {item.label}
          </Link>
        );
      })}

      {isAdmin && (
        <>
          <div className="px-3 pt-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 border-t mt-4">
            Admin Services
          </div>
          {adminItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                  active
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon size={18} className="group-hover:scale-110" />
                {item.label}
              </Link>
            );
          })}
        </>
      )}

      <div className="pt-4 mt-4 border-t">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
