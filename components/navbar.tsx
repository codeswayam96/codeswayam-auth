"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto flex h-16 items-center px-6">
                <Link href="/" className="flex items-center gap-2.5 mr-8">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                        <Zap size={16} className="text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">CodeSwayam</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1 flex-1">
                    {navLinks.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-2 ml-auto">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">Sign in</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/signup">Get Started Free</Link>
                    </Button>
                </div>

                <button
                    className="md:hidden ml-auto p-2 rounded-md text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                >
                    {open ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t bg-background px-6 pb-4 space-y-1">
                    {navLinks.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="block px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
                            onClick={() => setOpen(false)}
                        >
                            {l.label}
                        </a>
                    ))}
                    <div className="pt-3 flex flex-col gap-2">
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/login">Sign in</Link>
                        </Button>
                        <Button asChild className="w-full">
                            <Link href="/signup">Get Started Free</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
