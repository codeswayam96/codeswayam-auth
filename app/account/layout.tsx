"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, CreditCard, Settings, LogOut, Zap, Loader2, Shield, DollarSign, LayoutDashboard, Coins, Users, Menu, X, ChevronRight, FileText, Activity, Bell, LayoutGrid, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchProfile, logout } from "@/lib/api";
import { toast } from "sonner";
import { BrandLoader } from "@/components/brand-loader";

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
}>({ user: null, setUser: () => { }, loading: true });

export function useAccount() {
  return useContext(AccountContext);
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/account", icon: Home, label: "Overview" },
  { href: "/account/profile", icon: User, label: "Profile" },
  { href: "/account/apps", icon: LayoutGrid, label: "My Apps" },
  { href: "/account/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/account/security", icon: Shield, label: "Security" },
  { href: "/account/billing", icon: DollarSign, label: "Billing" },
  { href: "/account/credits", icon: Coins, label: "Credits" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/account/notifications", icon: Bell, label: "Notifications" },
  { href: "/account/activity", icon: Activity, label: "Activity" },
  { href: "/account/referrals", icon: Users, label: "Referrals" },
  { href: "/account/preferences", icon: Settings, label: "Preferences" },
];

const adminItems = [
  { href: "/account/admin/domains", icon: Shield, label: "SSO Domains" },
  { href: "/account/admin/referrals", icon: Users, label: "Referral Panel" },
  { href: "/account/admin/security", icon: Shield, label: "Security Center" },
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
    return <BrandLoader fullScreen text="Verifying your credentials..." />;
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // ── Account Status Banner ─────────────────────────────────────────────────
  const STATUS_BANNERS: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode; title: string; body: string }> = {
    suspended: {
      bg: "bg-red-50", border: "border-red-200", text: "text-red-800",
      icon: <XCircle size={16} className="text-red-600 shrink-0" />,
      title: "Account Suspended",
      body: user?.rejectionReason
        ? `Your account has been suspended. Reason: ${user.rejectionReason}. Please contact support.`
        : "Your account has been suspended. Please contact support@codeswayam.com for assistance.",
    },
    rejected: {
      bg: "bg-red-50", border: "border-red-200", text: "text-red-800",
      icon: <XCircle size={16} className="text-red-600 shrink-0" />,
      title: "Account Rejected",
      body: user?.rejectionReason
        ? `Your account was rejected. Reason: ${user.rejectionReason}.`
        : "Your account registration was not approved. Contact support for details.",
    },
    pending_deletion: {
      bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800",
      icon: <AlertTriangle size={16} className="text-amber-600 shrink-0" />,
      title: "Deletion Requested",
      body: "Your account is scheduled for deletion and is pending admin review. You can still cancel this request by contacting support.",
    },
  };
  const statusBanner = user ? STATUS_BANNERS[user.status] : null;

  return (
    <AccountContext.Provider value={{ user, setUser, loading }}>
      <div className="min-h-screen bg-muted/30">
        {/* Top navbar */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
          <div className="max-w-[1440px] mx-auto flex h-16 items-center px-4 sm:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 mr-auto hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap size={16} className="text-primary-foreground fill-current" />
              </div>
              <span className="font-bold text-sm sm:text-base tracking-tight">CodeSwayam</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-accent/50 p-1 rounded-lg sm:rounded-xl transition-all border border-transparent hover:border-border outline-none">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-background">
                      {initials}
                    </div>
                    <div className="hidden md:block text-left">
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

        {/* ── Account Status Banner ── */}
        {statusBanner && (
          <div className={`${statusBanner.bg} ${statusBanner.border} border-b px-4 sm:px-6 py-3`}>
            <div className="max-w-[1440px] mx-auto flex items-center gap-3">
              {statusBanner.icon}
              <div className="min-w-0">
                <span className={`font-bold text-sm ${statusBanner.text}`}>{statusBanner.title}: </span>
                <span className={`text-sm ${statusBanner.text} opacity-90`}>{statusBanner.body}</span>
              </div>
              <a
                href="mailto:support@codeswayam.com"
                className={`ml-auto shrink-0 text-xs font-bold underline ${statusBanner.text} whitespace-nowrap`}
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

        {/* Mobile Horizontal Nav (Sticky below header) */}
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

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight">My Account</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your profile, subscriptions, and account settings</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Sidebar nav (Desktop only) */}
            <nav className="hidden md:block shrink-0 space-y-1" style={{ width: "220px" }}>
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight">Settings</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-wider">Account Control</p>
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
                    <item.icon size={18} className={cn("transition-transform group-hover:scale-110", active ? "scale-110" : "")} />
                    {item.label}
                  </Link>
                );
              })}

              {(user?.role === "admin" || user?.role === "superadmin") && (
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
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 overflow-hidden" style={{ minWidth: 0 }}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </AccountContext.Provider>
  );
}
