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
import { Switch } from "@/components/ui/switch";
import { 
    Plus, 
    Trash2, 
    Shield, 
    Users, 
    Zap, 
    AlertCircle, 
    Loader2, 
    Save,
    TrendingUp,
    Percent,
    Coins
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ReferralTier {
    id: number;
    name: string;
    pointsPerReferral: number;
    maxDiscountPercentage: number;
    minReferralsRequired: number;
    isActive: boolean;
}

interface ReferralSettings {
    referralEnabled: boolean;
    referralPointsValue: number;
    maxPointsDiscountPercentage: number;
    pointsToCurrencyRate: number;
}

export default function AdminReferralsPage() {
    const [settings, setSettings] = useState<ReferralSettings | null>(null);
    const [tiers, setTiers] = useState<ReferralTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isAddingTier, setIsAddingTier] = useState(false);

    // New Tier Form
    const [newTier, setNewTier] = useState({
        name: "",
        pointsPerReferral: 100,
        maxDiscountPercentage: 50,
        minReferralsRequired: 10
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [settingsRes, tiersRes] = await Promise.all([
                fetch(`${API_URL}/admin/referrals/settings`, { credentials: "include" }),
                fetch(`${API_URL}/admin/referrals/tiers`, { credentials: "include" })
            ]);

            if (settingsRes.ok) setSettings(await settingsRes.json());
            if (tiersRes.ok) setTiers(await tiersRes.json());
        } catch (error) {
            toast.error("Failed to load referral data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!settings) return;
        setIsSavingSettings(true);
        try {
            const res = await fetch(`${API_URL}/admin/referrals/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
                credentials: "include",
            });
            if (res.ok) {
                toast.success("Settings updated successfully");
            }
        } catch (error) {
            toast.error("Error saving settings");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleAddTier = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingTier(true);
        try {
            const res = await fetch(`${API_URL}/admin/referrals/tiers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTier),
                credentials: "include",
            });
            if (res.ok) {
                toast.success("Tier added");
                setNewTier({ name: "", pointsPerReferral: 100, maxDiscountPercentage: 50, minReferralsRequired: 10 });
                fetchData();
            }
        } catch (error) {
            toast.error("Error adding tier");
        } finally {
            setIsAddingTier(false);
        }
    };

    const handleDeleteTier = async (id: number) => {
        if (!confirm("Are you sure? This will affect all users in this tier.")) return;
        try {
            const res = await fetch(`${API_URL}/admin/referrals/tiers/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                toast.success("Tier removed");
                setTiers(tiers.filter(t => t.id !== id));
            }
        } catch (error) {
            toast.error("Error deleting tier");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 pb-10">
            <div className="px-1 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Referral & Loyalty System</h2>
                <p className="text-sm text-muted-foreground">Manage influencer tiers and global reward policies.</p>
            </div>

            {/* Global Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Global Configuration
                    </CardTitle>
                    <CardDescription>Configure how points are earned and spent across the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl bg-muted/30 gap-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Enable Referral System</Label>
                            <p className="text-sm text-muted-foreground">Allow users to earn points by referring others.</p>
                        </div>
                        <Switch 
                            checked={settings?.referralEnabled} 
                            onCheckedChange={(v) => setSettings(s => s ? {...s, referralEnabled: v} : null)}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Default Points
                            </Label>
                            <Input 
                                type="number" 
                                value={Number.isNaN(settings?.referralPointsValue) ? "" : (settings?.referralPointsValue ?? "")} 
                                onChange={(e) => setSettings(s => s ? {...s, referralPointsValue: e.target.value === "" ? 0 : parseInt(e.target.value)} : null)}
                            />
                            <p className="text-[10px] text-muted-foreground">Standard points per successful refer.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Percent className="w-4 h-4" /> Max Discount
                            </Label>
                            <Input 
                                type="number" 
                                value={Number.isNaN(settings?.maxPointsDiscountPercentage) ? "" : (settings?.maxPointsDiscountPercentage ?? "")} 
                                onChange={(e) => setSettings(s => s ? {...s, maxPointsDiscountPercentage: e.target.value === "" ? 0 : parseInt(e.target.value)} : null)}
                            />
                            <p className="text-[10px] text-muted-foreground">Max % of a purchase payable with points.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Coins className="w-4 h-4" /> Conversion Rate
                            </Label>
                            <Input 
                                type="number" 
                                value={Number.isNaN(settings?.pointsToCurrencyRate) ? "" : (settings?.pointsToCurrencyRate ?? "")} 
                                onChange={(e) => setSettings(s => s ? {...s, pointsToCurrencyRate: e.target.value === "" ? 0 : parseInt(e.target.value)} : null)}
                            />
                            <p className="text-[10px] text-muted-foreground">How many points equal 1 Unit of currency.</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button className="w-full sm:w-auto" onClick={handleSaveSettings} disabled={isSavingSettings}>
                            {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Global Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Add Tier Form */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Add Influencer Tier
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddTier} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tier Name</Label>
                                <Input 
                                    placeholder="e.g. YouTube Elite" 
                                    value={newTier.name}
                                    onChange={(e) => setNewTier({...newTier, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Points per Refer</Label>
                                <Input 
                                    type="number" 
                                    value={Number.isNaN(newTier.pointsPerReferral) ? "" : (newTier.pointsPerReferral ?? "")}
                                    onChange={(e) => setNewTier({...newTier, pointsPerReferral: e.target.value === "" ? 0 : parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Discount %</Label>
                                <Input 
                                    type="number" 
                                    value={Number.isNaN(newTier.maxDiscountPercentage) ? "" : (newTier.maxDiscountPercentage ?? "")}
                                    onChange={(e) => setNewTier({...newTier, maxDiscountPercentage: e.target.value === "" ? 0 : parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Min Refers Required</Label>
                                <Input 
                                    type="number" 
                                    value={Number.isNaN(newTier.minReferralsRequired) ? "" : (newTier.minReferralsRequired ?? "")}
                                    onChange={(e) => setNewTier({...newTier, minReferralsRequired: e.target.value === "" ? 0 : parseInt(e.target.value)})}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isAddingTier}>
                                {isAddingTier ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                                Create Tier
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Tier List */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 px-1">
                        <Users className="w-5 h-5" /> Active Tiers
                    </h3>
                    
                    {tiers.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-muted/20">
                            <p className="text-muted-foreground">No custom tiers defined. Everyone uses global defaults.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {tiers.map((tier) => (
                                <Card key={tier.id} className="overflow-hidden">
                                    <div className="flex items-center justify-between p-4 bg-background">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {tier.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{tier.name}</h4>
                                                <div className="flex gap-3 mt-1">
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                                        {tier.pointsPerReferral} Pts / Refer
                                                    </span>
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                        {tier.maxDiscountPercentage}% Max Discount
                                                    </span>
                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                                        {tier.minReferralsRequired}+ Refers
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteTier(tier.id)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-sm flex gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>
                            Users are automatically promoted to higher tiers when they cross the 
                            <strong> Min Refers Required</strong> threshold. 
                            Influencers in higher tiers can offer better rewards to their followers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
