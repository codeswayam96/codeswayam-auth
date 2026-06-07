"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Coins, Zap, ShoppingCart, History, ArrowDownRight,
  ArrowUpRight, Star, Loader2, Sparkles,
  Package, CheckCircle2, Filter,
} from "lucide-react";
import {
  fetchMyWallet, fetchCreditPacks, fetchFeatureCosts,
  createCreditPurchaseOrder, verifyCreditPurchase,
  fetchReferralStats, type ReferralStats,
} from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BrandLoader } from "@/components/brand-loader";
import type { CreditPack, CreditTransaction, FeatureCreditCost, UserCredits } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatInr(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

type TxType = "purchase" | "usage" | "refund" | "bonus" | "adjustment" | "expiry";

const TX_CONFIG: Record<TxType, { label: string; pill: string; icon: string }> = {
  purchase:   { label: "Purchase",   pill: "bg-green-50 text-green-700 border-green-200",   icon: "text-green-600" },
  usage:      { label: "Used",       pill: "bg-red-50 text-red-700 border-red-200",         icon: "text-red-600" },
  refund:     { label: "Refund",     pill: "bg-blue-50 text-blue-700 border-blue-200",      icon: "text-blue-600" },
  bonus:      { label: "Bonus",      pill: "bg-violet-50 text-violet-700 border-violet-200", icon: "text-violet-600" },
  adjustment: { label: "Adjustment", pill: "bg-amber-50 text-amber-700 border-amber-200",   icon: "text-amber-600" },
  expiry:     { label: "Expired",    pill: "bg-gray-50 text-gray-600 border-gray-200",      icon: "text-gray-500" },
};

const CAT_STYLE: Record<string, { header: string; icon: string; text: string }> = {
  ai:        { header: "bg-violet-50 border-violet-200", icon: "text-violet-600", text: "text-violet-700" },
  export:    { header: "bg-blue-50 border-blue-200",     icon: "text-blue-600",   text: "text-blue-700" },
  analytics: { header: "bg-orange-50 border-orange-200", icon: "text-orange-600", text: "text-orange-700" },
  general:   { header: "bg-gray-50 border-gray-200",     icon: "text-gray-500",   text: "text-gray-700" },
};

function getCatStyle(cat: string) {
  return CAT_STYLE[cat] || CAT_STYLE.general;
}

// ─── Razorpay ─────────────────────────────────────────────────────────────────

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Pack Card ────────────────────────────────────────────────────────────────

function PackCard({ pack, onBuy, buying, referralStats }: {
  pack: CreditPack; onBuy: (pack: CreditPack, usePoints: boolean) => void; buying: boolean;
  referralStats: ReferralStats | null;
}) {
  const [usePoints, setUsePoints] = useState(false);
  
  // --- Points Discount Calculation ---
  const activePoints = referralStats?.points?.active || 0;
  const pointsToCurrencyRate = 10; // 10 pts = 1 INR
  const maxDiscountPercent = 30; // 30%

  let ptsUsed = 0;
  let discountAmount = 0;
  if (usePoints && activePoints > 0) {
    const maxDiscountAllowed = (pack.priceInr * maxDiscountPercent) / 100;
    const pointsValueInCurrency = activePoints / pointsToCurrencyRate;
    discountAmount = Math.min(maxDiscountAllowed, pointsValueInCurrency * 100);
    ptsUsed = Math.ceil((discountAmount / 100) * pointsToCurrencyRate);
  }

  const totalPts   = pack.points + (pack.bonusPoints ?? 0);
  const priceRs    = pack.priceInr / 100;
  const ptsPerRupee = (totalPts / priceRs).toFixed(1);
  const popular    = pack.isPopular === 1;

  return (
    <div className={`relative flex flex-col gap-4 overflow-hidden rounded-2xl border-2 p-6 transition-shadow
      ${popular
        ? "border-violet-600 bg-violet-50 shadow-lg shadow-violet-100"
        : "border-gray-200 bg-white shadow-sm"}`}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
          <Star size={9} fill="white" /> Popular
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
          ${popular
            ? "bg-gradient-to-br from-violet-600 to-indigo-600"
            : "bg-gradient-to-br from-gray-200 to-gray-300"}`}
        >
          <Coins size={22} className={popular ? "text-white" : "text-gray-500"} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-gray-900">{pack.name}</h3>
          {pack.description && (
            <p className="text-xs text-gray-500">{pack.description}</p>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-4xl font-black text-gray-900 leading-none">
          {totalPts.toLocaleString()}
        </span>
        <span className="text-sm font-semibold text-gray-500">pts</span>
        {(pack.bonusPoints ?? 0) > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
            +{pack.bonusPoints} bonus
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
        <div className="flex flex-col">
          {usePoints && discountAmount > 0 && (
            <span className="text-[10px] font-bold text-gray-400 line-through mb-[-2px]">
              {formatInr(pack.priceInr)}
            </span>
          )}
          <span className="text-2xl font-black text-violet-600">
            {formatInr(usePoints ? Math.max(0, pack.priceInr - discountAmount) : pack.priceInr)}
          </span>
        </div>
        <span className="text-xs font-semibold text-gray-400">≈ {ptsPerRupee} pts/₹</span>
      </div>

      {/* Points Redemption Toggle */}
      <div className={`rounded-xl border p-3 transition-colors ${
        activePoints > 0 
          ? "border-amber-200 bg-amber-50/50" 
          : "border-gray-100 bg-gray-50/50 opacity-80"
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Star size={14} className={activePoints > 0 ? "text-amber-500" : "text-gray-400"} fill="currentColor" />
            <span className="text-[11px] font-bold text-gray-700">Use Referral Points</span>
          </div>
          <Switch 
            checked={usePoints} 
            onCheckedChange={setUsePoints} 
            className="scale-75 origin-right" 
            disabled={activePoints <= 0}
          />
        </div>
        {usePoints && activePoints > 0 && (
          <div className="mt-2 pt-2 border-t border-amber-200/30 flex items-center justify-between text-[10px] font-bold text-amber-700">
            <span>Applying {ptsUsed.toLocaleString()} points</span>
            <span>-{formatInr(discountAmount)}</span>
          </div>
        )}
        {activePoints <= 0 && (
          <p className="mt-1.5 text-[9px] font-medium text-gray-400">
            No active referral points to redeem.
          </p>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => onBuy(pack, usePoints)}
        disabled={buying}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60
          ${popular
            ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90"
            : "bg-gradient-to-r from-gray-700 to-gray-900 hover:opacity-90"}`}
      >
        {buying ? <Loader2 size={15} className="animate-spin" /> : <ShoppingCart size={15} />}
        {buying ? "Processing…" : `Buy ${totalPts.toLocaleString()} pts`}
      </button>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: CreditTransaction }) {
  const cfg     = TX_CONFIG[tx.type as TxType] || TX_CONFIG.adjustment;
  const isDebit = tx.points < 0;

  return (
    <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-b-0">
      {/* Icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${cfg.pill}`}>
        {isDebit
          ? <ArrowUpRight size={15} className={cfg.icon} />
          : <ArrowDownRight size={15} className={cfg.icon} />}
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{tx.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${cfg.pill}`}>
            {cfg.label}
          </span>
          <span className="text-[10px] text-gray-400">
            {new Date(tx.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short",
            })}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className={`text-sm font-extrabold ${isDebit ? "text-red-600" : "text-green-600"}`}>
          {isDebit ? "" : "+"}{tx.points.toLocaleString()} pts
        </p>
        <p className="text-[10px] text-gray-400">bal: {tx.balanceAfter.toLocaleString()}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreditsPage() {
  const [wallet,       setWallet]       = useState<UserCredits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [packs,        setPacks]        = useState<CreditPack[]>([]);
  const [features,     setFeatures]     = useState<FeatureCreditCost[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [buying,       setBuying]       = useState<number | null>(null);
  const [txFilter,     setTxFilter]     = useState("all");
  const [activeTab,    setActiveTab]    = useState<"buy" | "history" | "features">("buy");
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  // Pagination for transaction history
  const [txPage, setTxPage] = useState(1);
  const TX_PAGE_SIZE = 15;
  const filteredTxAll = txFilter === "all" ? transactions : transactions.filter(t => t.type === txFilter);
  const txTotalPages = Math.max(1, Math.ceil(filteredTxAll.length / TX_PAGE_SIZE));
  const filteredTx = filteredTxAll.slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE);
  // Reset page when filter changes
  const handleTxFilter = (f: string) => { setTxFilter(f); setTxPage(1); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, packsRes, featuresRes, refRes] = await Promise.all([
        fetchMyWallet(), fetchCreditPacks(), fetchFeatureCosts(), fetchReferralStats().catch(() => null)
      ]);
      setWallet(walletRes.wallet);
      setTransactions(walletRes.transactions);
      setPacks(packsRes);
      setFeatures(featuresRes);
      setReferralStats(refRes);
    } catch (err: any) {
      toast.error(err.message || "Failed to load credits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBuy = async (pack: CreditPack, usePoints = false) => {
    setBuying(pack.id);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error("Payment gateway failed to load."); return; }
      const order = await createCreditPurchaseOrder(pack.id, "INR", usePoints);
      await new Promise<void>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: order.keyId, amount: order.amount,
          currency: order.currency || "INR",
          name: "CodeSwayam Credits",
          description: `${pack.name} — ${order.pack.totalPoints} pts`,
          order_id: order.orderId,
          handler: async (response: any) => {
            try {
              const result = await verifyCreditPurchase({
                packId: pack.id,
                razorpay_order_id:    response.razorpay_order_id,
                razorpay_payment_id:  response.razorpay_payment_id,
                razorpay_signature:   response.razorpay_signature,
                pointsUsed:           (order as any).pointsUsed,
              });
              toast.success(`✅ ${result.pointsAdded.toLocaleString()} credits added!`);
              await load();
              resolve();
            } catch (err: any) { reject(err); }
          },
          modal: { ondismiss: () => resolve() },
          theme: { color: "#7c3aed" },
        });
        rzp.open();
      });
    } catch (err: any) {
      toast.error(err.message || "Purchase failed");
    } finally {
      setBuying(null);
    }
  };

  const featuresByCategory = features.reduce<Record<string, FeatureCreditCost[]>>((acc, f) => {
    const cat = f.category || "general";
    (acc[cat] = acc[cat] || []).push(f);
    return acc;
  }, {});

  if (loading) {
    return <BrandLoader size="md" text="Syncing user wallet and credits..." />;
  }

  const balance = wallet?.balance ?? 0;
  const TABS = [
    { id: "buy",      label: "Buy Credits",                     icon: <ShoppingCart size={14} /> },
    { id: "history",  label: `History (${transactions.length})`, icon: <History size={14} /> },
    { id: "features", label: "What Credits Buy",                icon: <Zap size={14} /> },
  ] as const;

  return (
    <div className="space-y-6 pb-12">

      {/* ── Wallet hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-violet-700 px-8 py-7 text-white">
        {/* decorative coin */}
        <div className="pointer-events-none absolute -bottom-4 right-4 opacity-[0.07]">
          <Coins size={160} />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Balance */}
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest opacity-75">Credit Balance</p>
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl font-black leading-none">{balance.toLocaleString()}</span>
              <span className="text-lg sm:text-xl font-semibold opacity-75">pts</span>
            </div>
            {wallet && (
              <p className="mt-2 text-xs sm:text-sm opacity-70">
                Lifetime: <strong>{wallet.lifetimeEarned.toLocaleString()}</strong>
                {" · "}Used: <strong>{wallet.lifetimeSpent.toLocaleString()}</strong>
              </p>
            )}
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap">
            {[
              { label: "Earned", value: wallet?.lifetimeEarned ?? 0, icon: <ArrowDownRight size={14} /> },
              { label: "Used",   value: wallet?.lifetimeSpent  ?? 0, icon: <ArrowUpRight   size={14} /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="rounded-xl border border-white/20 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-sm">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold opacity-75">
                  {icon} {label}
                </div>
                <p className="text-lg sm:text-xl font-black">{value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] sm:text-sm font-semibold transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Buy Credits ─────────────────────────────────────────── */}
      {activeTab === "buy" && (
        <div className="space-y-5">
          {packs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-14 text-center">
              <Package size={32} className="mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No credit packs available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map(pack => (
                <PackCard key={pack.id} pack={pack} onBuy={handleBuy} buying={buying === pack.id} referralStats={referralStats} />
              ))}
            </div>
          )}

          {/* Trust note */}
          <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 px-5 py-4">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-violet-600" />
            <div>
              <p className="text-sm font-bold text-violet-700">Secure payments via Razorpay</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Credits are added instantly after payment. No subscription — buy once, use anytime across all CodeSwayam platforms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: History ─────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              <Filter size={11} /> Filter:
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "purchase", "usage", "bonus", "adjustment"].map(f => (
                <button
                  key={f}
                  onClick={() => handleTxFilter(f)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold capitalize transition-colors
                    ${txFilter === f
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-gray-200 bg-white text-gray-500 hover:border-violet-300 hover:text-violet-600"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <History size={28} className="mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">
                {txFilter === "all" ? "No transactions yet. Buy credits to get started!" : `No ${txFilter} transactions.`}
              </p>
            </div>
          ) : (
            <>
            <div className="divide-y divide-gray-50">
              {filteredTx.map(tx => <TxRow key={tx.id} tx={tx} />)}
            </div>
            {txTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50 text-xs text-gray-500">
                <span>{(txPage - 1) * TX_PAGE_SIZE + 1}–{Math.min(txPage * TX_PAGE_SIZE, filteredTxAll.length)} of {filteredTxAll.length} transactions</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage === 1}
                    className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span className="px-2">{txPage} / {txTotalPages}</span>
                  <button onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))} disabled={txPage === txTotalPages}
                    className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* ── Tab: What Credits Buy ────────────────────────────────────── */}
      {activeTab === "features" && (
        <div className="space-y-4">
          {Object.keys(featuresByCategory).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-14 text-center">
              <Sparkles size={32} className="mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">Feature costs will appear here once configured.</p>
            </div>
          ) : (
            Object.entries(featuresByCategory).map(([category, fts]) => {
              const cs = getCatStyle(category);
              return (
                <div key={category} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {/* Category header */}
                  <div className={`flex items-center gap-2 border-b px-5 py-3 ${cs.header}`}>
                    <Zap size={13} className={cs.icon} />
                    <span className={`text-[11px] font-extrabold uppercase tracking-widest ${cs.text}`}>
                      {category}
                    </span>
                    <span className="ml-1 text-[11px] text-gray-400">
                      {fts.length} feature{fts.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Feature rows */}
                  <div className="divide-y divide-gray-50">
                    {fts.map(f => (
                      <div key={f.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{f.featureName}</p>
                          {f.description && (
                            <p className="text-xs text-gray-500">{f.description}</p>
                          )}
                          <p className="mt-0.5 font-mono text-[11px] text-gray-400">
                            {f.saasId} · {f.featureKey}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-black text-violet-600">
                          <Zap size={11} fill="currentColor" />
                          {f.pointCost.toLocaleString()} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}