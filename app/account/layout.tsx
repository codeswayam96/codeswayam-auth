"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, CreditCard, Settings, LogOut, Zap, Loader2, Shield, DollarSign, LayoutDashboard, Coins, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchProfile, logout } from "@/lib/api";
import { toast } from "sonner";

interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  role: string;
  status: string;
  googleId: string | null;
  lastActiveAt: string | null;
  twoFactorEnabled: boolean;
  rejectionReason?: string | null;
  createdAt: string;
}

const AccountContext = createContext<{
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  loading: boolean;
}>({ user: null, setUser: () => {}, loading: true });

export function useAccount() {
  return useContext(AccountContext);
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/account", icon: Home, label: "Overview" },
  { href: "/account/profile", icon: User, label: "Profile" },
  { href: "/account/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/account/security", icon: Shield, label: "Security" },
  { href: "/account/billing", icon: DollarSign, label: "Billing" },
  { href: "/account/credits", icon: Coins, label: "Credits" },
  { href: "/account/referrals", icon: Users, label: "Referrals" },
  { href: "/account/preferences", icon: Settings, label: "Preferences" },
];

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure cookies are processed by the browser
    const timer = setTimeout(() => {
      fetchProfile()
        .then((res) => setUser(res?.data ?? res))
        .catch(() => {
          router.push("/login");
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AccountContext.Provider value={{ user, setUser, loading }}>
      <div className="min-h-screen bg-muted/30">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
          <div className="max-w-7xl mx-auto flex h-16 items-center px-6">
            <Link href="/dashboard" className="flex items-center gap-2 mr-auto hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap size={16} className="text-primary-foreground fill-current" />
              </div>
              <span className="font-bold text-base tracking-tight">CodeSwayam</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 hover:bg-accent/50 p-1.5 rounded-xl transition-all border border-transparent hover:border-border outline-none">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-background">
                      {initials}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold leading-none">{displayName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{user?.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-xl border-border/50">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                    <Link href="/account/profile" className="flex items-center gap-2"><User size={14} /> Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                    <Link href="/account/security" className="flex items-center gap-2"><Shield size={14} /> Security</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer rounded-lg py-2">
                    <LogOut size={14} className="mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight">My Account</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your profile, subscriptions, and account settings</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar nav */}
            <nav className="shrink-0 space-y-0.5" style={{ width: "220px", maxWidth: "100%" }}>
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>

            {/* Main content */}
            <main className="flex-1" style={{ minWidth: 0, width: "100%" }}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </AccountContext.Provider>
  );
}
