"use client";

import { useState, useEffect } from "react";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Plus, 
    Trash2, 
    Shield, 
    Globe, 
    CheckCircle, 
    AlertCircle, 
    Loader2 
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface TrustedDomain {
    id: number;
    domain: string;
    appName: string | null;
    isActive: boolean;
    allowSubdomains: boolean;
    createdAt: string;
}

export default function AdminDomainsPage() {
    const [domains, setDomains] = useState<TrustedDomain[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDomain, setNewDomain] = useState("");
    const [newAppName, setNewAppName] = useState("");
    const [allowSubdomains, setAllowSubdomains] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/auth/domains`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setDomains(data);
            }
        } catch (error) {
            toast.error("Failed to load domains");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain) return;

        // Sanitize the domain: strip protocols (http://, https://), paths, and ports
        // This ensures only the raw hostname (e.g., "auraflow.com") gets saved to the database.
        let sanitizedDomain = newDomain.trim().toLowerCase();
        try {
            const urlString = sanitizedDomain.startsWith("http") ? sanitizedDomain : `https://${sanitizedDomain}`;
            sanitizedDomain = new URL(urlString).hostname;
        } catch {
            // Fallback if parsing fails, but trim and lowercase are already applied
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/admin/auth/domains`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: sanitizedDomain, appName: newAppName, allowSubdomains }),
                credentials: "include",
            });

            if (res.ok) {
                toast.success("Domain added successfully");
                setNewDomain("");
                setNewAppName("");
                setAllowSubdomains(true);
                fetchDomains();
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to add domain");
            }
        } catch (error) {
            toast.error("Error adding domain");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDomain = async (id: number) => {
        if (!confirm("Are you sure you want to remove this trusted domain?")) return;

        try {
            const res = await fetch(`${API_URL}/admin/auth/domains/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.ok) {
                toast.success("Domain removed");
                setDomains(domains.filter(d => d.id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete domain");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">SSO Trusted Domains</h2>
                <p className="text-muted-foreground">Manage domains authorized to use CodeSwayam Auth for SSO.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Domain</CardTitle>
                        <CardDescription>Whitelist a new domain for cross-domain authentication.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddDomain} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="domain">Domain Name</Label>
                                <Input 
                                    id="domain" 
                                    placeholder="auraflow.com" 
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="appName">App Name (Optional)</Label>
                                <Input 
                                    id="appName" 
                                    placeholder="Auraflow SaaS" 
                                    value={newAppName}
                                    onChange={(e) => setNewAppName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3 pt-2">
                                <Label>Security Match Policy</Label>
                                <div className="space-y-2">
                                    <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <input 
                                            type="radio" 
                                            name="allowSubdomains" 
                                            className="mt-1"
                                            checked={allowSubdomains === true}
                                            onChange={() => setAllowSubdomains(true)}
                                        />
                                        <div>
                                            <p className="font-medium text-sm leading-none">Complete Whitelist (Include Subdomains)</p>
                                            <p className="text-xs text-muted-foreground mt-1">Allows {newDomain ? `*.${newDomain}` : "*.domain.com"} and {newDomain || "domain.com"}</p>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <input 
                                            type="radio" 
                                            name="allowSubdomains" 
                                            className="mt-1"
                                            checked={allowSubdomains === false}
                                            onChange={() => setAllowSubdomains(false)}
                                        />
                                        <div>
                                            <p className="font-medium text-sm leading-none">Strict Whitelist (Exact Match Only)</p>
                                            <p className="text-xs text-muted-foreground mt-1">Only allows strictly {newDomain || "domain.com"}</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Add Trusted Domain
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Security Policy</CardTitle>
                        <CardDescription>Important information about SSO domains.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex gap-3 items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <p>Subdomains of trusted domains (e.g., app.auraflow.com) are automatically allowed.</p>
                        </div>
                        <div className="flex gap-3 items-start">
                            <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p>The Auth Service will only redirect users back to these verified domains.</p>
                        </div>
                        <div className="flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p>Removing a domain will immediately break SSO functionality for that application.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Whitelisted Domains</CardTitle>
                    <CardDescription>Current domains authorized for SSO handshakes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : domains.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                            <Globe className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p>No external domains whitelisted yet.</p>
                            <p className="text-xs">localhost and codeswayam.com are allowed by default.</p>
                        </div>
                    ) : (
                        <div className="divide-y border rounded-xl overflow-hidden bg-background">
                            {domains.map((d) => (
                                <div key={d.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm">{d.domain}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${d.allowSubdomains ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {d.allowSubdomains ? 'Includes Subdomains' : 'Strict Match'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{d.appName || "Unnamed App"}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteDomain(d.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
