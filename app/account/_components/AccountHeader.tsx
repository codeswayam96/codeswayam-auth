import React from "react";
import Link from "next/link";
import { Zap, User, Shield, LogOut } from "lucide-react";
import { NotificationBell } from "@codeswayam/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountHeaderProps {
  displayName: string;
  email?: string;
  initials: string;
  onLogout: () => void;
}

export function AccountHeader({
  displayName,
  email,
  initials,
  onLogout,
}: AccountHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="max-w-[1440px] mx-auto flex h-16 items-center px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 mr-auto hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap size={16} className="text-primary-foreground fill-current" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight">CodeSwayam</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell
            onNavigate={(url) => { window.location.href = url; }}
            onOpenSettings={() => { window.location.href = "/account/profile#notifications"; }}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-accent/50 p-1 rounded-lg sm:rounded-xl transition-all border border-transparent hover:border-border outline-none cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-background">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold leading-none">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-xl border-border/50">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                <Link href="/account/profile" className="flex items-center gap-2">
                  <User size={14} /> Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                <Link href="/account/security" className="flex items-center gap-2">
                  <Shield size={14} /> Security
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive cursor-pointer rounded-lg py-2"
              >
                <LogOut size={14} className="mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
