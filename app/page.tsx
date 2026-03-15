"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Zap,
    Shield,
    Key,
    Globe,
    Users,
    ArrowRight,
    Check,
    Lock,
    Fingerprint,
    Layers,
    BarChart3,
    RefreshCw,
    Code2,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { checkUserAuth } from "@/lib/auth-redirect";

// ─── Data ───────────────────────────────────────────────────────────────────

const features = [
    {
        icon: Key,
        title: "Single Sign-On",
        description:
            "Log in once and access every CodeSwayam app seamlessly. No repeated credential prompts across subdomains.",
    },
    {
        icon: Shield,
        title: "Enterprise-Grade Security",
        description:
            "HttpOnly, Secure, SameSite cookies. CSRF protection and XSS-safe design backed by industry best practices.",
    },
    {
        icon: Globe,
        title: "Cross-Domain Session",
        description:
            "Shared auth cookie across all *.codeswayam.com subdomains with configurable domain policies for production and localhost.",
    },
    {
        icon: Fingerprint,
        title: "Google OAuth",
        description:
            "One-tap Google sign-in alongside email/password, so users can choose the auth method that works best for them.",
    },
    {
        icon: Layers,
        title: "Role-Based Access",
        description:
            "Granular roles — user, subscriber, editor, admin, superadmin — propagated automatically across all connected apps.",
    },
    {
        icon: RefreshCw,
        title: "Instant Password Reset",
        description:
            "Secure token-based password reset flow with time-limited links, fully handled by core-api.",
    },
    {
        icon: BarChart3,
        title: "Activity Tracking",
        description:
            "Last active timestamps and account status monitoring give you visibility into every session.",
    },
    {
        icon: Code2,
        title: "Developer-First API",
        description:
            "RESTful auth endpoints on core-api. Integrate SSO into any new subdomain in minutes, not days.",
    },
];

const steps = [
    {
        step: "01",
        title: "Create Your Account",
        description:
            "Sign up once with your email or Google account. Your identity is securely stored and managed by core-api.",
    },
    {
        step: "02",
        title: "Log In at auth.codeswayam.com",
        description:
            "A secure HttpOnly cookie is issued and shared across all *.codeswayam.com subdomains automatically.",
    },
    {
        step: "03",
        title: "Access Every App",
        description:
            "Navigate to any CodeSwayam product — your session follows you without re-authentication.",
    },
    {
        step: "04",
        title: "Manage in One Place",
        description:
            "Update your profile, change passwords, view your subscription, and revoke sessions from a single dashboard.",
    },
];

const stats = [
    { value: "1", label: "account for all apps" },
    { value: "< 200ms", label: "average auth latency" },
    { value: "100%", label: "HttpOnly cookie security" },
    { value: "∞", label: "connected subdomains" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const isAuthenticated = await checkUserAuth(apiUrl);
            if (isAuthenticated) {
                router.push("/account");
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    // Show nothing while checking authentication
    if (isLoading) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1">
                {/* ── Hero ── */}
                <section className="relative overflow-hidden bg-background">
                    {/* Gradient blobs */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
                        style={{
                            background:
                                "radial-gradient(circle, hsl(262 83% 57%) 0%, transparent 70%)",
                        }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10"
                        style={{
                            background:
                                "radial-gradient(circle, hsl(262 83% 57%) 0%, transparent 70%)",
                        }}
                    />

                    <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 text-center">
                        <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
                            ✦ Centralized SSO for the CodeSwayam Platform
                        </Badge>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
                            One Account.{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(135deg, hsl(262 83% 57%), hsl(280 80% 65%))",
                                }}
                            >
                                Every Tool.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Sign in once at{" "}
                            <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
                                auth.codeswayam.com
                            </code>{" "}
                            and access every app across the platform — no extra logins, no extra passwords.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" asChild className="min-w-40">
                                <Link href="/signup">
                                    Get Started Free <ArrowRight size={16} className="ml-1" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="min-w-40">
                                <Link href="/login">Sign in</Link>
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                            {[
                                { icon: Lock, text: "Secure HttpOnly Cookies" },
                                { icon: Shield, text: "XSS & CSRF Protected" },
                                { icon: Users, text: "Google OAuth Supported" },
                                { icon: Globe, text: "Cross-Subdomain SSO" },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-1.5">
                                    <Icon size={12} className="text-primary" />
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Stats ── */}
                <section className="border-y bg-muted/30">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((s) => (
                                <div key={s.label} className="text-center">
                                    <p className="text-3xl md:text-4xl font-extrabold text-primary mb-1">
                                        {s.value}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Features ── */}
                <section id="features" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <Badge variant="secondary" className="mb-4">Features</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Everything you need to authenticate securely
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Built for developers and users alike — powerful under the hood,
                            invisible in day-to-day use.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((f) => (
                            <Card
                                key={f.title}
                                className="group hover:shadow-md hover:border-primary/30 transition-all duration-200"
                            >
                                <CardHeader className="pb-2">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                                        <f.icon size={18} className="text-primary" />
                                    </div>
                                    <CardTitle className="text-base">{f.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {f.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* ── How it Works ── */}
                <section
                    id="how-it-works"
                    className="scroll-mt-20 bg-muted/30 border-y"
                >
                    <div className="max-w-7xl mx-auto px-6 py-24">
                        <div className="text-center mb-16">
                            <Badge variant="secondary" className="mb-4">How it Works</Badge>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                Auth in four simple steps
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                                Designed to be invisible to end users and effortless for developers.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {steps.map((s, i) => (
                                <div key={s.step} className="relative">
                                    {i < steps.length - 1 && (
                                        <div
                                            aria-hidden
                                            className="hidden lg:block absolute top-6 left-[calc(100%-12px)] w-full h-px border-t-2 border-dashed border-border z-0"
                                        />
                                    )}
                                    <div className="relative z-10 bg-background rounded-xl p-6 border h-full">
                                        <span className="inline-block text-3xl font-extrabold text-primary/20 mb-4 leading-none">
                                            {s.step}
                                        </span>
                                        <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {s.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── About ── */}
                <section id="about" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-24">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge variant="secondary" className="mb-4">About</Badge>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                                Built for a growing ecosystem
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-5">
                                CodeSwayam is a platform of developer tools, automation engines,
                                and productivity apps — all running on independent subdomains.
                                Managing separate logins for each was painful, so we built a
                                centralized SSO service that works seamlessly across all of them.
                            </p>
                            <p className="text-muted-foreground leading-relaxed mb-8">
                                This auth service runs at{" "}
                                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                    auth.codeswayam.com
                                </code>{" "}
                                and integrates with the core-api backend to issue domain-wide
                                cookies, validate sessions, and power Google OAuth — all in
                                production-ready infrastructure.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Open source-friendly architecture",
                                    "JWT-backed cookie sessions via core-api",
                                    "Instant subdomain integration",
                                    "Role propagation across all apps",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-2.5 text-sm">
                                        <Check size={16} className="text-primary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual illustration */}
                        <div className="bg-muted/50 rounded-2xl p-8 border space-y-4">
                            {[
                                { sub: "auth.codeswayam.com", role: "Identity Provider", active: true },
                                { sub: "app.codeswayam.com", role: "Main App", active: false },
                                { sub: "tools.codeswayam.com", role: "Dev Tools", active: false },
                                { sub: "dash.codeswayam.com", role: "Analytics", active: false },
                            ].map((item) => (
                                <div
                                    key={item.sub}
                                    className={`flex items-center justify-between p-3 rounded-lg border bg-background ${
                                        item.active ? "border-primary/40 bg-primary/5" : ""
                                    }`}
                                >
                                    <div>
                                        <p className="text-xs font-mono font-medium">{item.sub}</p>
                                        <p className="text-xs text-muted-foreground">{item.role}</p>
                                    </div>
                                    <Badge
                                        variant={item.active ? "default" : "secondary"}
                                        className="text-xs"
                                    >
                                        {item.active ? "Auth Hub" : "SSO Connected"}
                                    </Badge>
                                </div>
                            ))}
                            <div className="pt-2 text-center">
                                <p className="text-xs text-muted-foreground">
                                    One cookie. All subdomains. Zero friction.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Contact ── */}
                <section id="contact" className="scroll-mt-20 bg-muted/30 border-y">
                    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                        <Badge variant="secondary" className="mb-4">Contact</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Questions or issues?
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            Reach out to the CodeSwayam team for support, partnership inquiries,
                            or just to say hello.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" asChild>
                                <a href="mailto:support@codeswayam.com">
                                    <Mail size={16} className="mr-1" />
                                    support@codeswayam.com
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <a
                                    href="https://github.com/codeswayam"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="max-w-7xl mx-auto px-6 py-24 text-center">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Ready to get started?
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                            Create your free CodeSwayam account and unlock access to the entire
                            platform with one set of credentials.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" asChild>
                                <Link href="/signup">
                                    Create Free Account <ArrowRight size={16} className="ml-1" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/login">Already have an account?</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
