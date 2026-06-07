"use client";

import { useEffect, useState } from "react";
import { fetchReferralStats, ReferralStats, redeemReferralCode } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2, Copy, CheckCircle2, Link2,
  Coins, Users, Gift, ArrowRight, AlertCircle, Shield,
} from "lucide-react";
import { BrandLoader } from "@/components/brand-loader";

type CopyType = "code" | "link" | null;

export default function ReferralsPage() {
  const [stats, setStats]                 = useState<ReferralStats | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [copiedType, setCopiedType]       = useState<CopyType>(null);
  const [friendCode, setFriendCode]       = useState("");
  const [redeeming, setRedeeming]         = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{
    type: "success" | "error"; text: string;
  } | null>(null);

  // Pagination for history
  const [histPage, setHistPage] = useState(1);
  const HIST_PAGE_SIZE = 10;
  const history = stats?.history ?? [];
  const histTotalPages = Math.max(1, Math.ceil(history.length / HIST_PAGE_SIZE));
  const pagedHistory = history.slice((histPage - 1) * HIST_PAGE_SIZE, histPage * HIST_PAGE_SIZE);

  useEffect(() => {
    (async () => {
      try { setStats(await fetchReferralStats()); }
      catch (err: any) { setError(err.message || "Failed to load referral stats"); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleCopy = () => {
    if (!stats) return;
    navigator.clipboard.writeText(stats.referralCode);
    setCopiedType("code");
    setTimeout(() => setCopiedType(null), 1800);
  };

  const handleCopyInviteLink = () => {
    if (!stats || typeof window === "undefined") return;
    navigator.clipboard.writeText(
      `${window.location.origin}/signup?ref=${encodeURIComponent(stats.referralCode)}`
    );
    setCopiedType("link");
    setTimeout(() => setCopiedType(null), 1800);
  };

  const handleRedeemFriendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCode.trim()) return;
    setRedeemMessage(null);
    setRedeeming(true);
    try {
      const res = await redeemReferralCode(friendCode.trim());
      setRedeemMessage({ type: "success", text: `${res.message} (+${res.pointsAwarded} points)` });
      setFriendCode("");
      setStats(await fetchReferralStats());
    } catch (err: any) {
      setRedeemMessage({ type: "error", text: err?.message || "Failed to redeem referral code" });
    } finally {
      setRedeeming(false);
    }
  };

  /* ── Loading ── */
  if (loading) return <BrandLoader size="md" text="Loading referral data..." />;

  /* ── Error ── */
  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <div className="flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-violet-100/60 to-white px-5 sm:px-7 py-5 sm:py-6 text-center sm:text-left">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border-[28px] border-violet-200/40" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-violet-600">Referral Program</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Earn Points</h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-gray-500">
              Share your code, invite friends, and collect bonus points.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-violet-700 shadow-sm">
            <Gift size={14} /> Reward system active
          </div>
        </div>
      </div>

      {/* ── Referral card ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row">

          {/* LEFT: Your referral code — 60% */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-white p-6 md:w-[60%] md:border-r md:border-violet-100">
            {/* glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />

            {/* label pill */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 shadow-sm">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600">
                <Link2 size={10} color="#fff" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">
                Your Referral Code
              </span>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-gray-500">
              Share this code or link with friends to earn bonus points for every sign‑up.
            </p>

            {/* code box */}
            <div className="mb-4 inline-block rounded-xl border border-violet-200 bg-white px-5 py-3 shadow-sm shadow-violet-100">
              <p className="font-mono text-xl font-extrabold leading-none tracking-[0.18em] text-violet-700">
                {stats?.referralCode ?? "──────"}
              </p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Referral code
              </p>
            </div>

            {/* action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80
                  ${copiedType === "code" ? "bg-violet-800" : "bg-violet-600"}`}
              >
                {copiedType === "code" ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copiedType === "code" ? "Copied!" : "Copy Code"}
              </button>
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-violet-50 active:bg-violet-100
                  ${copiedType === "link" ? "text-violet-800" : "text-violet-600"}`}
              >
                {copiedType === "link" ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
                {copiedType === "link" ? "Copied!" : "Copy Invite Link"}
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              💡 Share the invite link for easier one‑click redemption.
            </p>
          </div>

          {/* mobile divider */}
          <div className="h-px bg-gray-100 md:hidden" />

          {/* RIGHT: Redeem a friend's code — 40% */}
          <div className="flex flex-col justify-center bg-white p-6 md:w-[40%]">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50">
                <Gift size={14} className="text-amber-500" />
              </span>
              <h3 className="text-base font-bold text-gray-900">Have a friend's code?</h3>
            </div>
            <p className="mb-5 pl-9 text-sm text-gray-500">
              Redeem once and get instant bonus points in your wallet.
            </p>

            <form onSubmit={handleRedeemFriendCode} className="flex flex-col gap-2.5">
              <Input
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                placeholder="e.g. FRIEND42"
                className="h-10 font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal"
              />
              <button
                type="submit"
                disabled={redeeming || !friendCode.trim()}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {redeeming ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                {redeeming ? "Redeeming…" : "Redeem Code"}
              </button>
            </form>

            {redeemMessage && (
              <div className={`mt-3 rounded-lg border px-4 py-2.5 text-sm ${
                redeemMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}>
                {redeemMessage.text}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4 sm:p-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
              <Users size={20} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Redeemed</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stats?.totalRedeemed ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-12 h-12 text-emerald-600" />
          </div>
          <CardContent className="flex items-center gap-4 p-4 sm:p-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
              <Coins size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Active Points</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats?.points?.active ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm bg-amber-50/30 border-dashed">
          <CardContent className="flex items-center gap-4 p-4 sm:p-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
              <Loader2 size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Pending</p>
                <div className="group relative cursor-help">
                    <AlertCircle size={10} className="text-gray-400" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                        Held for 7 days to prevent fraud.
                    </div>
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{stats?.points?.pending ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Redemption history ──────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Redemption History</h2>

        {stats?.history && stats.history.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm no-scrollbar">
            <table className="w-full text-left text-sm text-gray-600 min-w-[500px] sm:min-w-0">
              <thead className="border-b bg-gray-50 text-[10px] sm:text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Date</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-right font-semibold">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedHistory.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-green-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-semibold text-green-600 text-xs sm:text-sm">
                      +{item.pointsAwarded}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {histTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t bg-gray-50/50 text-xs text-gray-500">
                <span>{(histPage - 1) * HIST_PAGE_SIZE + 1}–{Math.min(histPage * HIST_PAGE_SIZE, history.length)} of {history.length} entries</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={histPage === 1}
                    className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span className="px-2">{histPage} / {histTotalPages}</span>
                  <button onClick={() => setHistPage(p => Math.min(histTotalPages, p + 1))} disabled={histPage === histTotalPages}
                    className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-200 shadow-none">
            <CardContent className="flex flex-col items-center p-12 text-center text-gray-500">
              <Users size={32} className="mb-4 text-gray-300" />
              <p className="font-medium">No redemptions yet</p>
              <p className="mt-1 text-sm">When someone uses your referral code, activity appears here.</p>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}