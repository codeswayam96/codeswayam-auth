"use client";

import { useState, useEffect, createContext, useContext, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { User, Shield, CreditCard, LogOut, Zap, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchProfile, logout } from "@/lib/api";
import { toast } from "sonner";
import { resolveClientAppContext, type AppMetadata } from "@/lib/app-context";

interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  role: string;
  status: string;
  clerkId: string | null;
  googleId: string | null;
  lastActiveAt: string | null;
  createdAt: string;
}

const ProfileContext = createContext<{
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  loading: boolean;
  appContext: AppMetadata | null;
}>({ user: null, setUser: () => {}, loading: true, appContext: null });

export function useProfile() {
  return useContext(ProfileContext);
}

const navItems = [
  { href: "/profile", icon: User, label: "Account" },
  { href: "/profile/security", icon: Shield, label: "Security" },
  { href: "/profile/subscription", icon: CreditCard, label: "Subscription" },
];

function ProfileLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [appContext, setAppContext] = useState<AppMetadata | null>(() => resolveClientAppContext(searchParams));

  useEffect(() => {
    const ctx = resolveClientAppContext(searchParams);
    if (ctx) {
      setAppContext(ctx);
    }
  }, [searchParams]);

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
  const queryStr = searchParams?.toString();
  const querySuffix = queryStr ? `?${queryStr}` : "";

  return (
    <ProfileContext.Provider value={{ user, setUser, loading, appContext }}>
      <div className="min-h-screen bg-muted/30">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto flex h-14 items-center px-6 gap-4">
            <div className="flex items-center gap-3 mr-auto">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-xs">
                  <Zap size={14} className="text-primary-foreground" />
                </div>
                <span className="font-bold text-sm">CodeSwayam</span>
              </Link>

              {appContext?.returnUrl && (
                <>
                  <span className="text-muted-foreground/30 hidden sm:inline">/</span>
                  <a
                    href={appContext.returnUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 transition-all shadow-xs group"
                    title={`Return to ${appContext.name}`}
                  >
                    <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to {appContext.name}</span>
                  </a>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {appContext?.returnUrl && (
                <a
                  href={appContext.returnUrl}
                  className="sm:hidden text-xs text-primary font-semibold flex items-center gap-1"
                >
                  <ArrowLeft size={12} />
                  {appContext.name}
                </a>
              )}
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium hidden sm:block">{displayName}</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Active originating application banner */}
          {appContext && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/30">
                  <Zap size={20} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Connected SaaS Session</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    Managing account from <span className="text-primary font-bold">{appContext.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Profile details, credentials, and subscriptions sync seamlessly across your connected workspace.
                  </p>
                </div>
              </div>

              {appContext.returnUrl && (
                <a
                  href={appContext.returnUrl}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0 active:scale-95 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  Return to {appContext.name}
                </a>
              )}
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account, security, and subscription</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar nav */}
            <nav className="w-full md:w-56 shrink-0 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={`${item.href}${querySuffix}`}
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
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProfileContext.Provider>
  );
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProfileLayoutContent>{children}</ProfileLayoutContent>
    </Suspense>
  );
}
