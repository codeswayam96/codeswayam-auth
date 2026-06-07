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
    ShieldAlert, 
    ShieldCheck, 
    Lock, 
    Unlock, 
    History, 
    Globe, 
    Terminal, 
    Loader2, 
    Save,
    AlertTriangle,
    Eye,
    Shield
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BrandLoader } from "@/components/brand-loader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface SecurityLog {
    id: number;
    userId: number;
    userEmail: string;
    event: string;
    description: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}

interface AdminSettings {
    maxLoginAttempts: string;
    whitelistedIps: string;
    notifySecurityAlerts: boolean;
}

export default function AdminSecurityPage() {
    const [settings, setSettings] = useState<AdminSettings | null>(null);
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [settingsRes, logsRes] = await Promise.all([
                fetch(`${API_URL}/admin/settings`, { credentials: "include" }),
                fetch(`${API_URL}/admin/security/logs`, { credentials: "include" })
            ]);

            if (settingsRes.ok) setSettings(await settingsRes.json());
            if (logsRes.ok) setLogs(await logsRes.json());
        } catch (error) {
            toast.error("Failed to load security data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/admin/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
                credentials: "include",
            });
            if (res.ok) {
                toast.success("Security settings updated");
            }
        } catch (error) {
            toast.error("Error saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUnlockUser = async (userId: number) => {
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}/unlock`, {
                method: "POST",
                credentials: "include",
            });
            if (res.ok) {
                toast.success("User account unlocked");
                fetchData();
            }
        } catch (error) {
            toast.error("Error unlocking user");
        }
    };

    const getEventIcon = (event: string) => {
        if (event.includes('locked')) return <Lock className="w-4 h-4 text-destructive" />;
        if (event.includes('success')) return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
        if (event.includes('failed')) return <ShieldAlert className="w-4 h-4 text-amber-500" />;
        return <Terminal className="w-4 h-4 text-muted-foreground" />;
    };

    if (loading) return <BrandLoader size="md" text="Loading security settings..." />;

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Security & Audit Center</h2>
                <p className="text-muted-foreground">Monitor login attempts and manage whitelists.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Security Configuration */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Security Policy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Max Login Attempts</Label>
                            <Input 
                                type="number" 
                                value={settings?.maxLoginAttempts}
                                onChange={(e) => setSettings(s => s ? {...s, maxLoginAttempts: e.target.value} : null)}
                            />
                            <p className="text-[10px] text-muted-foreground">Attempts before temporary account lockout.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>IP Whitelist</Label>
                            <textarea 
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={settings?.whitelistedIps}
                                onChange={(e) => setSettings(s => s ? {...s, whitelistedIps: e.target.value} : null)}
                                placeholder="127.0.0.1, ::1"
                            />
                            <p className="text-[10px] text-muted-foreground">Comma-separated IPs that bypass lockout.</p>
                        </div>
                        <Button className="w-full" onClick={handleSaveSettings} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Update Policy
                        </Button>

                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-[11px] text-amber-800 flex gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            Whitelisting an IP allows that device to attempt unlimited logins without being blocked.
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Logs */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" />
                                Security Audit Log
                            </CardTitle>
                            <CardDescription>Recent authentication and security events across the platform.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchData}>
                            <History className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile view for logs (Card stack) */}
                        <div className="md:hidden space-y-4">
                            {logs.length === 0 && <div className="text-center py-10 text-muted-foreground italic">No logs found</div>}
                            {logs.map((log) => (
                                <div key={log.id} className="p-4 rounded-xl border bg-card space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <div className="font-bold truncate text-sm">{log.userEmail}</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted border text-[9px] font-bold uppercase tracking-wider">
                                                {getEventIcon(log.event)}
                                                {log.event.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium">
                                            <Globe className="w-3 h-3 text-muted-foreground" />
                                            {log.ipAddress}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                                            &ldquo;{log.description}&rdquo;
                                        </p>
                                    </div>

                                    {log.event === 'account_locked' && (
                                        <Button 
                                            size="sm" 
                                            className="w-full h-8 text-xs font-bold bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                                            onClick={() => handleUnlockUser(log.userId)}
                                        >
                                            <Unlock className="w-3.5 h-3.5 mr-1.5" /> Unlock User
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Desktop view for logs (Table) */}
                        <div className="hidden md:block relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[200px]">User</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">Event</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP / Details</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                <div className="font-medium truncate max-w-[180px]">{log.userEmail}</div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    {getEventIcon(log.event)}
                                                    <span className="capitalize font-semibold text-[11px]">
                                                        {log.event.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Globe className="w-3 h-3 text-muted-foreground" />
                                                    {log.ipAddress}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground line-clamp-1 italic mt-0.5">
                                                    {log.description}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {log.event === 'account_locked' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => handleUnlockUser(log.userId)}
                                                    >
                                                        <Unlock className="w-4 h-4 mr-1" /> Unlock
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
