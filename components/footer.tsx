import Link from "next/link";
import { Zap, Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                                <Zap size={16} className="text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">CodeSwayam</span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            One account, every tool. Centralized authentication and identity
                            management for the entire CodeSwayam platform.
                        </p>
                        <div className="flex items-center gap-3 mt-5">
                            <a
                                href="https://github.com/codeswayam"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                aria-label="GitHub"
                            >
                                <Github size={16} />
                            </a>
                            <a
                                href="https://twitter.com/codeswayam"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter size={16} />
                            </a>
                            <a
                                href="mailto:support@codeswayam.com"
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                aria-label="Email"
                            >
                                <Mail size={16} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-4">Product</h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: "Features", href: "#features" },
                                { label: "How it Works", href: "#how-it-works" },
                                { label: "Sign Up", href: "/signup" },
                                { label: "Sign In", href: "/login" },
                            ].map((l) => (
                                <li key={l.label}>
                                    <a
                                        href={l.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-4">Company</h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: "About", href: "#about" },
                                { label: "Contact", href: "#contact" },
                                { label: "Privacy Policy", href: "#" },
                                { label: "Terms of Service", href: "#" },
                            ].map((l) => (
                                <li key={l.label}>
                                    <a
                                        href={l.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} CodeSwayam. All rights reserved.</p>
                    <p>Built with ❤️ for developers</p>
                </div>
            </div>
        </footer>
    );
}
